const t=require("node:test"),a=require("node:assert/strict");
const C=require("../src/core.js"),A=require("../src/analytics.js");

function completed(){
 const c=C.controller(C.newSession("streamer",0));
 c.start(1000);
 c.record("follow","first",61000);
 c.pause(181000);
 c.start(601000);
 c.record("raid","second",661000);
 c.record("clip","third",841000);
 c.finish(1021000);
 return JSON.parse(c.exportJson());
}

t("timeline subtracts pauses and places manually recorded events on active minutes",()=>{
 const s=A.analyze(completed(),1021000);
 a.equal(s.activeMs,600000);
 a.equal(s.eventsRecorded,3);
 a.equal(s.eventsPerHour,18);
 a.equal(s.buckets.length,10);
 a.equal(s.buckets[1].types.follow,1);
 a.equal(s.buckets[4].types.raid,1);
 a.equal(s.buckets[7].types.clip,1);
 a.equal(s.buckets.reduce((n,b)=>n+b.total,0),3);
});

t("ignore events in a pause or after stream end instead of creating fake engagement",()=>{
 const raw=completed();
 raw.events.push({at:300000,type:"marker",note:"paused"});
 raw.events.push({at:1200000,type:"follow",note:"after"});
 const result=A.analyze(raw,1200000);
 a.equal(result.skipped,2);
 a.equal(result.eventsRecorded,3);
 a.equal(result.buckets.reduce((n,b)=>n+b.total,0),3);
});

t("open session clock stops at observation time",()=>{
 const c=C.controller(C.newSession("streamer",1000));
 c.start(2000);
 c.record("follow","test",4000);
 const s=A.analyze(c.exportJson(),30000);
 a.equal(s.activeMs,28000);
 a.equal(s.buckets.length,1);
 a.equal(s.eventsRecorded,1);
});

t("long sessions use at most 24 bounded timeline buckets",()=>{
 const c=C.controller(C.newSession("streamer",0));
 c.start(0);
 c.record("marker","begin",0);
 c.finish(100*3600000);
 const s=A.analyze(c.exportJson(),100*3600000);
 a.equal(s.buckets.length,24);
 a.equal(s.buckets.reduce((n,b)=>n+b.total,0),1);
});

t("empty session is safe, and malformed timestamps fail closed",()=>{
 const c=C.newSession("streamer",1000);
 const s=A.analyze(c,5000);
 a.equal(s.activeMs,0);
 a.equal(s.eventsPerHour,0);
 a.equal(s.buckets.length,1);
 a.throws(()=>A.analyze(c,Infinity),RangeError);
});
