import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {obsAuthentication,obsFrameMetrics,ObsWebSocket} from "../src/obs-websocket.mjs";

test("OBS v5 auth challenge: two SHA256 base64 passes",()=>{
  const hash=s=>createHash("sha256").update(s).digest("base64");
  assert.equal(obsAuthentication("pw","salt","challenge"),hash(hash("pwsalt")+"challenge"));
});
test("dropped frames use delta counters, not lifetime ratio",()=>{
  const old=obsFrameMetrics({outputActive:true,outputReconnecting:false,
    outputTotalFrames:1000,outputSkippedFrames:100});
  assert.equal(old.dropRatio,null);
  assert.equal(old.framesAdvancing,null);
  const next=obsFrameMetrics({outputActive:true,outputReconnecting:false,
    outputTotalFrames:1100,outputSkippedFrames:103},old.counters);
  assert.ok(Math.abs(next.dropRatio-.03)<1e-10);
  assert.equal(next.framesAdvancing,true);
  const stagnant=obsFrameMetrics({outputActive:true,outputReconnecting:false,
    outputTotalFrames:1100,outputSkippedFrames:103},next.counters);
  assert.equal(stagnant.dropRatio,null);
  assert.equal(stagnant.framesAdvancing,false);
  assert.throws(()=>obsFrameMetrics({outputActive:"yes",outputReconnecting:false}));
});
test("non-loopback OBS URLs are prohibited",()=>{
  assert.throws(()=>new ObsWebSocket({url:"ws://192.168.0.10:4455"}));
  assert.throws(()=>new ObsWebSocket({url:"wss://example.com"}));
  assert.throws(()=>new ObsWebSocket({url:"ws://user:pw@localhost:4455"}));
});
class FakeWs extends EventTarget{
  constructor(url){
    super();this.url=url;this.readyState=1;
    queueMicrotask(()=>this.emit({op:0,d:{rpcVersion:1,authentication:{salt:"a",challenge:"b"}}}));
  }
  emit(frame){this.dispatchEvent(new MessageEvent("message",{data:JSON.stringify(frame)}));}
  send(text){
    const frame=JSON.parse(text);
    if(frame.op===1){
      assert.equal(frame.d.authentication,obsAuthentication("secret","a","b"));
      queueMicrotask(()=>this.emit({op:2,d:{negotiatedRpcVersion:1}}));
    }
    if(frame.op===6){
      assert.equal(frame.d.requestType,"GetStreamStatus");
      queueMicrotask(()=>this.emit({op:7,d:{
        requestId:frame.d.requestId,requestType:"GetStreamStatus",
        requestStatus:{result:true,code:100},
        responseData:{outputActive:true,outputReconnecting:false,
          outputTotalFrames:100,outputSkippedFrames:2}
      }}));
    }
  }
  close(){
    this.readyState=3;
    this.dispatchEvent(new Event("close"));
  }
}
test("authenticates and polls OBS over a mocked real RPC handshake",async()=>{
  const obs=new ObsWebSocket({password:"secret",WebSocketImpl:FakeWs,now:()=>1234});
  const signal=await obs.poll();
  assert.equal(signal.streaming,true);
  assert.equal(signal.dropRatio,null);
  assert.equal(signal.framesAdvancing,null);
  assert.equal(signal.at,1234);
  obs.close();
});
