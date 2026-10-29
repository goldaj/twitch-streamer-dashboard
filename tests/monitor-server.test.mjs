import test from "node:test";
import assert from "node:assert/strict";
import {createMonitorServer} from "../monitor/server.mjs";
import {HealthCollector} from "../src/collector.mjs";

test("local-only monitor API serves status and protects write access",async()=>{
  const c=new HealthCollector({now:()=>1000});
  const server=createMonitorServer({collector:c});
  await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
  const url="http://127.0.0.1:"+server.address().port;
  try{
    let r=await fetch(url);
    assert.equal(r.status,200);
    assert.match(await r.text(),/surveillance locale expérimentale/);
    r=await fetch(url+"/api/status");
    assert.equal((await r.json()).decision.color,"gray");
    r=await fetch(url+"/api/intent",{method:"POST",body:JSON.stringify({armed:true}),
      headers:{"Content-Type":"application/json"}});
    assert.equal(r.status,403);
    r=await fetch(url+"/api/intent",{method:"POST",body:JSON.stringify({armed:true}),
      headers:{"Content-Type":"application/json","X-Local-Control":"stream-health",
        "Origin":"https://evil.invalid"}});
    assert.equal(r.status,403);
    r=await fetch(url+"/api/intent",{method:"POST",body:JSON.stringify({armed:true}),
      headers:{"Content-Type":"application/json","X-Local-Control":"stream-health"}});
    assert.equal(r.status,200);
    assert.equal((await r.json()).intent.armed,true);
    r=await fetch(url+"/api/intent",{method:"POST",body:JSON.stringify({armed:false}),
      headers:{"Content-Type":"application/json","X-Local-Control":"stream-health"}});
    assert.equal((await r.json()).intent.armed,false);
  }finally{await new Promise(ok=>server.close(ok));}
});
