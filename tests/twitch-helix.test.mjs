import test from "node:test";
import assert from "node:assert/strict";
import {TwitchHelix,TwitchError} from "../src/twitch-helix.mjs";

test("app token is cached and get streams checks precise channel",async()=>{
  const calls=[];let time=100_000;
  const client=new TwitchHelix({clientId:"cid",clientSecret:"secret",channel:"MyChannel",
    now:()=>time,fetchFn:async(url,opts)=>{
      calls.push({url,opts});
      if(url.includes("/oauth2/token"))return {ok:true,json:async()=>({access_token:"token",expires_in:3600})};
      assert.match(url,/user_login=mychannel/);
      assert.equal(opts.headers.Authorization,"Bearer token");
      return {ok:true,json:async()=>({data:[{id:"x",type:"live",user_login:"mychannel",started_at:"2026-10-26T15:00:00Z"}]})};
    }});
  assert.equal((await client.poll()).online,true);
  time+=45_000;
  assert.equal((await client.poll()).streamId,"x");
  assert.equal(calls.filter(x=>x.url.includes("/oauth2/token")).length,1);
  assert.equal(calls.filter(x=>x.url.includes("/helix/streams")).length,2);
});
test("Helix empty list means offline, error or malformed never means offline",async()=>{
  const config={clientId:"cid",clientSecret:"secret",channel:"channel"};
  const empty=new TwitchHelix({...config,fetchFn:async(url)=>url.includes("oauth2")?
    {ok:true,json:async()=>({access_token:"token",expires_in:3600})}:
    {ok:true,json:async()=>({data:[]})}});
  assert.equal((await empty.poll()).online,false);
  const bad=new TwitchHelix({...config,fetchFn:async(url)=>url.includes("oauth2")?
    {ok:true,json:async()=>({access_token:"token",expires_in:3600})}:
    {ok:false,status:429}});
  await assert.rejects(()=>bad.poll(),TwitchError);
  assert.equal(new TwitchHelix({channel:"channel"}).configured,false);
  assert.throws(()=>new TwitchHelix({channel:"https://bad.example"}),TwitchError);
});
test("HTTP 401 clears and refreshes expired/invalid token once",async()=>{
  const config={clientId:"cid",clientSecret:"secret",channel:"channel"};
  let auth=0,first=true;
  const t=new TwitchHelix({...config,fetchFn:async(url)=>{
    if(url.includes("oauth2")){auth++;return {ok:true,json:async()=>({access_token:"token"+auth,expires_in:4000})};}
    if(first){first=false;return {ok:false,status:401};}
    return {ok:true,json:async()=>({data:[]})};
  }});
  assert.equal((await t.poll()).online,false);
  assert.equal(auth,2);
});

test("rate-limit backoff skips repeated requests until bucket reset",async()=>{
  let time=500_000,calls=0;
  const t=new TwitchHelix({clientId:"cid",clientSecret:"secret",channel:"channel",now:()=>time,
    fetchFn:async(url)=>{
      calls++;
      if(url.includes("/oauth2/token"))return {ok:true,json:async()=>({access_token:"token",expires_in:3600})};
      return {ok:false,status:429,headers:{get:()=>String((time+25_000)/1000)}};
    }});
  await assert.rejects(()=>t.poll(),TwitchError);
  assert.equal(calls,2);
  time+=5000;
  await assert.rejects(()=>t.poll(),TwitchError);
  assert.equal(calls,2);
  time+=26000;
  await assert.rejects(()=>t.poll(),TwitchError);
  assert.equal(calls,3);
});
