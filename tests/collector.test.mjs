import test from "node:test";
import assert from "node:assert/strict";
import {HealthCollector} from "../src/collector.mjs";

test("live transmitter evidence alone cannot produce GREEN without viewer probe",async()=>{
  const c=new HealthCollector({now:()=>1000,
    twitch:{poll:async()=>({online:true,at:1000})},
    obs:{poll:async()=>({streaming:true,reconnecting:false,dropRatio:0,at:1000})}
  });
  c.intent(true);
  await c.refresh("twitch");await c.refresh("obs");
  const result=c.status();
  assert.equal(result.decision.color,"gray");
  assert.equal(result.intent.wasLive,true);
  assert.equal(result.sources.viewer,null);
  assert.equal(result.sources.obs.streaming,true);
  assert.equal(result.sources.twitch.online,true);
});
test("after live was observed, confirmed offline means unexpected outage; deliberate stop is gray",async()=>{
  let clock=100_000,online=true;
  const c=new HealthCollector({now:()=>clock,
    twitch:{poll:async()=>({online,at:clock})},
    obs:{poll:async()=>({streaming:true,reconnecting:false,dropRatio:.01,at:clock})}
  });
  c.intent(true);await c.refresh("twitch");await c.refresh("obs");
  online=false;clock+=100;
  await c.refresh("twitch");
  assert.equal(c.status().decision.color,"gray");
  clock+=8100;
  // Remains a valid Twitch observation; confirm 8-second outage.
  assert.equal(c.status().decision.color,"red");
  c.intent(false);
  assert.equal(c.status().decision.color,"gray");
});
test("errors fail closed and never fabricate offline",async()=>{
  const c=new HealthCollector({now:()=>1000,
    twitch:{poll:async()=>{throw new Error("top-secret-token");}},
    obs:{poll:async()=>{throw new Error("obs-password");}}
  });
  c.intent(true);
  await c.refresh("twitch");await c.refresh("obs");
  const response=JSON.stringify(c.status());
  assert.equal(c.status().decision.color,"gray");
  assert.doesNotMatch(response,/top-secret-token|obs-password/);
});
