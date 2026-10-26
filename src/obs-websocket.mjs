import {createHash} from "node:crypto";

/** OBS protocol v5 authentication. Secret never sent raw or logged. */
export function obsAuthentication(password,salt,challenge){
  const secret=createHash("sha256").update(password+salt).digest("base64");
  return createHash("sha256").update(secret+challenge).digest("base64");
}
export function obsFrameMetrics(current,previous=null){
  if(typeof current?.outputActive!=="boolean" || typeof current?.outputReconnecting!=="boolean")
    throw new Error("OBS GetStreamStatus incomplet.");
  const dropped=current.outputSkippedFrames,total=current.outputTotalFrames;
  let ratio=null,framesAdvancing=null;
  if(Number.isInteger(dropped)&&Number.isInteger(total)&&dropped>=0&&total>=0 && dropped<=total){
    if(previous && total>=previous.total && dropped>=previous.dropped){
      const dTotal=total-previous.total,dDropped=dropped-previous.dropped;
      framesAdvancing=dTotal>0;
      if(dTotal>0)ratio=dDropped/dTotal;
    }
    // First sample and reset cannot prove current health: do NOT use lifetime ratio.
  }
  return {streaming:current.outputActive,reconnecting:current.outputReconnecting,
    dropRatio:ratio,framesAdvancing,
    counters:Number.isInteger(total)&&Number.isInteger(dropped)&&total>=dropped&&dropped>=0?
      {total,dropped}:null};
}
/**
 * Minimal RPC client on Node 22 global WebSocket. Read-only GetStreamStatus.
 * Only loopback OBS is permitted. No high-volume audio meter subscriptions.
 */
export class ObsWebSocket {
  constructor({url="ws://127.0.0.1:4455",password="",WebSocketImpl=globalThis.WebSocket,
    now=Date.now,timeoutMs=6000}={}){
    const u=new URL(url);
    if(u.protocol!=="ws:" || !["127.0.0.1","localhost"].includes(u.hostname) ||
      u.username || u.password || (u.pathname!=="/" && u.pathname!=="") ||
      u.search || u.hash)throw new Error("OBS WebSocket doit être local (ws://127.0.0.1:4455).");
    this.url=url;this.password=password;this.WebSocketImpl=WebSocketImpl;
    this.now=now;this.timeoutMs=timeoutMs;
    this.socket=null;this.ready=false;this.connecting=null;this.pending=new Map();
    this.counter=0;this.previous=null;
  }
  async connect(){
    if(this.ready && this.socket?.readyState===1)return;
    if(this.connecting)return this.connecting;
    this.connecting=this._connect();
    try{await this.connecting;}finally{this.connecting=null;}
  }
  async _connect(){
    if(!this.WebSocketImpl)throw new Error("Node 22+ WebSocket nécessaire.");
    const socket=new this.WebSocketImpl(this.url);
    this.socket=socket;
    this.ready=false;
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>fail(new Error("Connexion OBS expirée.")),this.timeoutMs);
      let settled=false;
      const fail=e=>{
        if(settled)return;settled=true;clearTimeout(timeout);
        this.ready=false;try{socket.close();}catch{}
        reject(e instanceof Error?e:new Error("WebSocket OBS déconnecté."));
      };
      const done=()=>{
        if(settled)return;settled=true;clearTimeout(timeout);
        this.ready=true;resolve();
      };
      socket.addEventListener("error",()=>fail(new Error("Impossible de joindre OBS WebSocket.")));
      socket.addEventListener("close",()=>{
        this.ready=false;this.previous=null;
        for(const {reject,timer} of this.pending.values()){
          clearTimeout(timer);reject(new Error("OBS déconnecté."));
        }
        this.pending.clear();
        fail(new Error("OBS a fermé la connexion."));
      });
      socket.addEventListener("message",event=>{
        let frame;
        try{frame=JSON.parse(String(event.data));}catch{return;}
        if(frame.op===0 && !settled){
          try{
            const hello=frame.d;
            if(!hello || hello.rpcVersion<1)throw new Error("Version OBS WebSocket incompatible.");
            const identify={rpcVersion:1};
            if(hello.authentication){
              if(!this.password)throw new Error("Mot de passe OBS WebSocket manquant.");
              identify.authentication=obsAuthentication(this.password,
                hello.authentication.salt,hello.authentication.challenge);
            }
            socket.send(JSON.stringify({op:1,d:identify}));
          }catch(e){fail(e);}
        }else if(frame.op===2 && !settled){
          done();
        }else if(frame.op===7){
          const id=frame.d?.requestId;
          const pending=this.pending.get(id);
          if(!pending)return;
          this.pending.delete(id);clearTimeout(pending.timer);
          if(frame.d?.requestStatus?.result!==true){
            pending.reject(new Error("OBS a refusé "+frame.d?.requestType+"."));
          }else pending.resolve(frame.d?.responseData);
        }
      });
    });
  }
  async request(type){
    await this.connect();
    const socket=this.socket;
    if(!this.ready || socket?.readyState!==1)throw new Error("OBS non connecté.");
    const requestId="health-"+(++this.counter);
    return await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{
        this.pending.delete(requestId);
        reject(new Error("OBS GetStreamStatus expiré."));
      },this.timeoutMs);
      this.pending.set(requestId,{resolve,reject,timer});
      try{socket.send(JSON.stringify({op:6,d:{requestType:type,requestId}}));}
      catch(e){clearTimeout(timer);this.pending.delete(requestId);reject(e);}
    });
  }
  async poll(){
    const data=await this.request("GetStreamStatus");
    const metrics=obsFrameMetrics(data,this.previous);
    this.previous=metrics.counters;
    return {streaming:metrics.streaming,reconnecting:metrics.reconnecting,
      dropRatio:metrics.dropRatio,framesAdvancing:metrics.framesAdvancing,at:this.now()};
  }
  close(){
    this.ready=false;
    if(this.socket)try{this.socket.close();}catch{}
  }
}
