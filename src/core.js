(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.StreamDesk=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const TYPES=["follow","subscription","raid","clip","marker"],LIMIT=5000;
function isTime(n){return Number.isSafeInteger(n)&&n>=0&&n<=8640000000000000;}
function channelName(s){if(typeof s!=="string"||!/^[a-z0-9_]{3,25}$/i.test(s.trim()))throw new TypeError("Invalid Twitch channel");return s.trim().toLowerCase();}
function validate(input){
 const d=typeof input==="string"?JSON.parse(input):input;
 if(!d||d.version!==1||!["idle","live","paused","ended"].includes(d.status)||!isTime(d.created))throw new TypeError("Invalid session");
 channelName(d.channel);
 if(!Array.isArray(d.segments)||!Array.isArray(d.events)||d.segments.length>LIMIT||d.events.length>LIMIT)throw new TypeError("Invalid records");
 let last=d.created,open=0;
 for(const s of d.segments){if(!isTime(s.start)||s.start<last||!(s.end===null||isTime(s.end))||s.end!==null&&s.end<s.start)throw new TypeError("Invalid segment");if(s.end===null)open++;last=s.end===null?s.start:s.end;}
 if(open>1||(d.status==="live")!==(open===1)||d.status!=="live"&&d.segments.some(s=>s.end===null))throw new TypeError("Invalid open session");
 for(const e of d.events)if(!TYPES.includes(e.type)||!isTime(e.at)||typeof e.note!=="string"||e.note.length>160)throw new TypeError("Invalid event");
 return JSON.parse(JSON.stringify(d));
}
function newSession(channel,at=Date.now()){if(!isTime(at))throw new RangeError("Invalid timestamp");return{version:1,channel:channelName(channel),created:at,status:"idle",segments:[],events:[]};}
function controller(initial){
 let state=validate(initial);
 function transaction(change){const draft=validate(state);change(draft);state=validate(draft);return snapshot();}
 function snapshot(at=Date.now()){if(!isTime(at))throw new RangeError("Invalid timestamp");
  const elapsedMs=state.segments.reduce((sum,s)=>sum+Math.max(0,(s.end===null?at:s.end)-s.start),0);
  return {channel:state.channel,status:state.status,elapsedMs,counts:Object.fromEntries(TYPES.map(t=>[t,state.events.filter(e=>e.type===t).length])),events:state.events.map(e=>({...e})),created:state.created};}
 function start(at=Date.now()){return transaction(d=>{if(!["idle","paused"].includes(d.status))throw new Error("Invalid state");const last=d.segments.at(-1);if(!isTime(at)||at<d.created||last&&at<last.end)throw new RangeError("Clock moved backwards");d.status="live";d.segments.push({start:at,end:null});});}
 function pause(at=Date.now()){return transaction(d=>{if(d.status!=="live")throw new Error("Invalid state");const s=d.segments.at(-1);if(!isTime(at)||at<s.start)throw new RangeError("Invalid pause");s.end=at;d.status="paused";});}
 function finish(at=Date.now()){return transaction(d=>{if(!["live","paused"].includes(d.status))throw new Error("Invalid state");if(d.status==="live"){const s=d.segments.at(-1);if(!isTime(at)||at<s.start)throw new RangeError("Invalid finish");s.end=at;}d.status="ended";});}
 function record(type,note="",at=Date.now()){return transaction(d=>{if(d.status!=="live")throw new Error("Not live");if(!TYPES.includes(type))throw new RangeError("Invalid event");if(!isTime(at)||at<d.segments.at(-1).start)throw new RangeError("Invalid time");if(d.events.length===LIMIT)throw new RangeError("Too many events");d.events.push({type,note:String(note).trim().slice(0,160).replace(/[\u0000-\u001f]/g," "),at});});}
 function exportJson(){return JSON.stringify(state,null,2)+"\n";}
 return Object.freeze({snapshot,start,pause,finish,record,exportJson});
}
function duration(ms){const s=Math.floor(Math.max(0,ms)/1000);return[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(n=>String(n).padStart(2,"0")).join(":");}
function csvCell(value){let s=String(value);if(/^\s*[=+\-@]/.test(s))s="'"+s;return'"'+s.replaceAll('"','""')+'"';}
function csv(data){const d=validate(data),rows=[["time","event","note"].map(csvCell).join(",")];for(const e of d.events)rows.push([new Date(e.at).toISOString(),e.type,e.note].map(csvCell).join(","));return"\ufeff"+rows.join("\r\n")+"\r\n";}
return Object.freeze({TYPES,newSession,controller,validate,duration,csv});
});