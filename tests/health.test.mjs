import test from "node:test";
import assert from "node:assert/strict";
import {assess,HealthMonitor,HEALTH} from "../src/health.mjs";

const T=1_000_000;
function snapshot(overrides={}){
  return {
    armed:true, expectedLive:true,wasLive:true,soundExpected:true,
    twitch:{online:true,at:T},
    obs:{streaming:true,reconnecting:false,dropRatio:.005,framesAdvancing:true,at:T},
    viewer:{videoPlaying:true,framesAdvancing:true,audioTrack:true,audioActive:true,at:T},
    ...overrides
  };
}
test("green needs three fresh independent positive sources",()=>{
  assert.equal(assess(snapshot(),T).color,HEALTH.HEALTHY);
  assert.equal(assess(snapshot({viewer:null}),T).color,HEALTH.UNKNOWN);
  assert.equal(assess(snapshot({twitch:{online:true,at:T-100_000}}),T).color,HEALTH.UNKNOWN);
  assert.equal(assess(snapshot({obs:{streaming:true,at:T-20_000}}),T).color,HEALTH.UNKNOWN);
  assert.equal(assess(snapshot({viewer:{videoPlaying:true,framesAdvancing:true,audioTrack:true,at:T}}),T).color,HEALTH.UNKNOWN);
});
test("orange for degradations but not missing observability",()=>{
  assert.equal(assess(snapshot({viewer:{videoPlaying:false,framesAdvancing:false,audioTrack:true,audioActive:true,at:T}}),T).color,HEALTH.DEGRADED);
  assert.equal(assess(snapshot({viewer:{videoPlaying:true,framesAdvancing:true,audioTrack:false,audioActive:false,at:T}}),T).color,HEALTH.DEGRADED);
  assert.equal(assess(snapshot({viewer:{videoPlaying:true,framesAdvancing:true,audioTrack:true,audioActive:false,at:T}}),T).color,HEALTH.DEGRADED);
  assert.equal(assess(snapshot({obs:{streaming:true,reconnecting:true,at:T}}),T).color,HEALTH.DEGRADED);
  assert.equal(assess(snapshot({obs:{streaming:true,framesAdvancing:true,dropRatio:.3,at:T}}),T).color,HEALTH.DEGRADED);
});
test("intentional silence and intentional ending never cause red",()=>{
  assert.equal(assess(snapshot({soundExpected:false,viewer:{
    videoPlaying:true,framesAdvancing:true,audioTrack:true,audioActive:false,at:T
  }}),T).color,HEALTH.HEALTHY);
  assert.equal(assess(snapshot({expectedLive:false,twitch:{online:false,at:T}}),T).color,HEALTH.UNKNOWN);
  assert.equal(assess(snapshot({wasLive:false,twitch:{online:false,at:T}}),T).color,HEALTH.UNKNOWN);
  assert.equal(assess(snapshot({armed:false,twitch:{online:false,at:T}}),T).color,HEALTH.UNKNOWN);
  assert.equal(assess(snapshot({twitch:{online:false,at:T}}),T).color,HEALTH.INTERRUPTED);
});
test("after red confirmation, returning signal must be verified before green",()=>{
  const mon=new HealthMonitor();
  const down=snapshot({twitch:{online:false,at:T}});
  assert.equal(mon.update(down,T).color,HEALTH.UNKNOWN);
  assert.equal(mon.update({...down,twitch:{online:false,at:T+7_500}},T+7_500).color,HEALTH.UNKNOWN);
  assert.equal(mon.update({...down,twitch:{online:false,at:T+8_010}},T+8_010).color,HEALTH.INTERRUPTED);
  const back=snapshot({twitch:{online:true,at:T+8_100},obs:{streaming:true,reconnecting:false,dropRatio:0,framesAdvancing:true,at:T+8_100},
    viewer:{videoPlaying:true,framesAdvancing:true,audioTrack:true,audioActive:true,at:T+8_100}});
  assert.equal(mon.update(back,T+8_100).color,HEALTH.UNKNOWN);
  const ready=snapshot({twitch:{online:true,at:T+11_200},obs:{streaming:true,reconnecting:false,dropRatio:0,framesAdvancing:true,at:T+11_200},
    viewer:{videoPlaying:true,framesAdvancing:true,audioTrack:true,audioActive:true,at:T+11_200}});
  assert.equal(mon.update(ready,T+11_200).color,HEALTH.HEALTHY);
});
test("never continue showing green when probes disappear or red is suspected",()=>{
  const mon=new HealthMonitor({recoverConfirmMs:0});
  assert.equal(mon.update(snapshot(),T).color,HEALTH.HEALTHY);
  assert.equal(mon.update(snapshot({viewer:null}),T+10).color,HEALTH.UNKNOWN);
  mon.update(snapshot({twitch:{online:false,at:T+100}}),T+100);
  assert.equal(mon.update(snapshot({twitch:{online:false,at:T+500}}),T+500).color,HEALTH.UNKNOWN);
});

test("source-specific freshness follows Twitch 45s and OBS 3s polling",()=>{
  const seen=T+48_000;
  const s=snapshot({
    obs:{streaming:true,reconnecting:false,dropRatio:.002,framesAdvancing:true,at:seen},
    viewer:{videoPlaying:true,framesAdvancing:true,audioTrack:true,audioActive:true,at:seen}
  });
  assert.equal(assess(s,seen).color,HEALTH.HEALTHY);
  assert.equal(assess(s,seen+91_000).color,HEALTH.UNKNOWN);
  assert.equal(assess(snapshot({obs:{streaming:true,reconnecting:false,dropRatio:null,at:T}}),T).color,
    HEALTH.UNKNOWN);
});
