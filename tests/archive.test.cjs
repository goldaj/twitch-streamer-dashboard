const t=require("node:test"),a=require("node:assert/strict"),C=require("../src/core.js"),A=require("../src/archive.js");
function finished(name,time=1000){const s=C.controller(C.newSession(name,time));s.start(time+100);s.record("follow","hello",time+200);s.finish(time+600);return s.exportJson();}
t("adds completed sessions, deduplicates identity",()=>{const h=A.create();a.equal(h.add(finished("streamer")),true);a.equal(h.add(finished("streamer")),false);a.equal(h.summary().sessions,1);});
t("refuses active sessions without modifying archive",()=>{const h=A.create(),c=C.controller(C.newSession("streamer",1000));c.start(1100);a.throws(()=>h.add(c.exportJson()));a.equal(h.summary().sessions,0);});
t("aggregates duration and counts",()=>{const h=A.create();h.add(finished("streamer",1000));h.add(finished("streamer",2000));const s=h.summary();a.equal(s.duration,1000);a.equal(s.counts.follow,2);});
t("export round trip plus merge is idempotent",()=>{const h=A.create();h.add(finished("streamer",1000));const other=A.create(h.exportJson());other.merge(h.exportJson());a.deepEqual(other.summary(),h.summary());});
t("removes by stable key only",()=>{const h=A.create();h.add(finished("streamer",1000));h.add(finished("streamer",2000));a.equal(h.remove("streamer:1000"),true);a.equal(h.summary().sessions,1);});
t("malformed import remains atomic",()=>{const h=A.create();h.add(finished("streamer",1000));const malicious=JSON.stringify({version:1,sessions:[JSON.parse(finished("streamer",2000)),{version:1,status:"live"}]});a.throws(()=>h.merge(malicious));a.equal(h.summary().sessions,1);});
