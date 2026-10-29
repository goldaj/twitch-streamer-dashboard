(function(root,factory){const core=root?.StreamDesk||(typeof module==="object"?require("./core.js"):null);const api=factory(core);if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.StreamArchive=api;})(typeof globalThis!=="undefined"?globalThis:this,function(core){
"use strict";
const MAX_SESSIONS=100;
function id(session){return session.channel+":"+session.created;}
function load(raw){
 const d=typeof raw==="string"?JSON.parse(raw):raw;
 if(!d||d.version!==1||!Array.isArray(d.sessions)||d.sessions.length>MAX_SESSIONS)throw new TypeError("Invalid archive");
 const ids=new Set();
 const sessions=d.sessions.map(s=>{
  const clean=core.validate(s);
  if(clean.status!=="ended")throw new TypeError("Only completed sessions may be archived");
  const key=id(clean);if(ids.has(key))throw new TypeError("Duplicate session ID");
  ids.add(key);return clean;
 });
 return sessions;
}
function create(initial={version:1,sessions:[]}){
 let sessions=load(initial);
 function list(){return sessions.map(s=>({id:id(s),channel:s.channel,created:s.created,
  duration:s.segments.reduce((n,seg)=>n+seg.end-seg.start,0),
  counts:Object.fromEntries(core.TYPES.map(t=>[t,s.events.filter(e=>e.type===t).length]))}))
  .sort((a,b)=>b.created-a.created);}
 function summary(){
  const rows=list();
  return{sessions:rows.length,duration:rows.reduce((a,b)=>a+b.duration,0),
   counts:Object.fromEntries(core.TYPES.map(t=>[t,rows.reduce((n,s)=>n+s.counts[t],0)]))};
 }
 function add(raw){
  const next=core.validate(raw);
  if(next.status!=="ended")throw new TypeError("Finish the session before archiving");
  if(sessions.some(s=>id(s)===id(next)))return false;
  if(sessions.length>=MAX_SESSIONS)throw new RangeError("Archive full; export it first");
  sessions=[...sessions,next];return true;
 }
 function merge(raw){
  const incoming=load(raw);const draft=sessions.slice();
  for(const s of incoming){if(!draft.some(other=>id(s)===id(other)))draft.push(s);}
  if(draft.length>MAX_SESSIONS)throw new RangeError("Archive full");
  sessions=draft;return sessions.length;
 }
 function remove(key){
  const next=sessions.filter(s=>id(s)!==key);const changed=next.length!==sessions.length;sessions=next;return changed;
 }
 function exportJson(){return JSON.stringify({version:1,sessions},null,2)+"\n";}
 return Object.freeze({list,summary,add,merge,remove,exportJson});
}
return Object.freeze({create,MAX_SESSIONS});
});