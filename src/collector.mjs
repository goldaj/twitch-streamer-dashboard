import {HealthMonitor} from "./health.mjs";

/**
 * Polls independently. A failed API poll replaces that source with null:
 * no stale green and no stale false red. No viewer probe until proven.
 */
export class HealthCollector {
  constructor({twitch,obs,now=Date.now,monitor=new HealthMonitor()}={}){
    this.twitch=twitch;this.obs=obs;this.now=now;this.monitor=monitor;
    this.snapshot={armed:false,expectedLive:false,wasLive:false,
      soundExpected:true,twitch:null,obs:null,viewer:null};
    this.errors={twitch:null,obs:null,viewer:"Sonde spectateur non encore intégrée"};
    this.busy={twitch:false,obs:false};
    this.running=false;this.timers=[];
  }
  intent(active){
    if(typeof active!=="boolean")throw new TypeError("Intent doit être booléen.");
    this.snapshot.armed=active;
    this.snapshot.expectedLive=active;
    if(!active){
      this.snapshot.wasLive=false;
      this.monitor=new HealthMonitor();
    }
    return this.snapshot.armed;
  }
  async refresh(kind){
    if(!["twitch","obs"].includes(kind))throw new RangeError("Source inconnue.");
    if(this.busy[kind])return;
    this.busy[kind]=true;
    try{
      const adapter=this[kind];
      if(!adapter)throw new Error("Connecteur non configuré.");
      const signal=await adapter.poll();
      this.snapshot[kind]=signal;
      this.errors[kind]=null;
      if(kind==="twitch" && this.snapshot.armed && signal.online===true){
        this.snapshot.wasLive=true;
      }
    }catch(e){
      this.snapshot[kind]=null;
      // Never expose transport credentials, raw URLs or provider response bodies.
      this.errors[kind]=kind==="twitch"?"Statut Twitch indisponible":
        "OBS inaccessible ou données invalides";
    }finally{this.busy[kind]=false;}
  }
  status(){
    const now=this.now();
    const decision=this.monitor.update(this.snapshot,now);
    return {at:now,decision,
      intent:{armed:this.snapshot.armed,wasLive:this.snapshot.wasLive},
      sources:{
        twitch:this.snapshot.twitch?{online:this.snapshot.twitch.online,at:this.snapshot.twitch.at}:null,
        obs:this.snapshot.obs?{streaming:this.snapshot.obs.streaming,
          reconnecting:this.snapshot.obs.reconnecting,dropRatio:this.snapshot.obs.dropRatio,
          framesAdvancing:this.snapshot.obs.framesAdvancing,at:this.snapshot.obs.at}:null,
        viewer:null
      },errors:{...this.errors},completeViewerCheck:false};
  }
  start(){
    if(this.running)return;
    this.running=true;
    void this.refresh("obs");void this.refresh("twitch");
    this.timers=[
      setInterval(()=>void this.refresh("obs"),3_000),
      setInterval(()=>void this.refresh("twitch"),10_000)
    ];
  }
  stop(){
    this.running=false;
    for(const t of this.timers)clearInterval(t);
    this.timers=[];
    this.obs?.close?.();
  }
}
