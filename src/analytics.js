(function(root,factory){
 const core=root?.StreamDesk||(typeof module==="object"?require("./core.js"):null);
 const api=factory(core);
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.StreamAnalytics=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(core){
"use strict";
const MAX_BUCKETS=24, MIN_BUCKET_MS=60000;

function analyze(input,at=Date.now()){
 const session=core.validate(input);
 if(!Number.isSafeInteger(at)||at<0||at>8640000000000000)throw new RangeError("Invalid observation clock");
 let activeMs=0;
 const intervals=[];
 for(const segment of session.segments){
  const end=segment.end===null?Math.max(segment.start,at):segment.end;
  const length=Math.max(0,end-segment.start);
  intervals.push({start:segment.start,end:end,offset:activeMs});
  activeMs+=length;
 }
 const bucketMs=Math.max(MIN_BUCKET_MS,Math.ceil(activeMs/(MAX_BUCKETS*MIN_BUCKET_MS))*MIN_BUCKET_MS);
 const count=Math.max(1,Math.min(MAX_BUCKETS,Math.ceil(activeMs/bucketMs)));
 const buckets=Array.from({length:count},(_,i)=>({
  fromMs:i*bucketMs,toMs:Math.min(activeMs,(i+1)*bucketMs),
  total:0,types:Object.fromEntries(core.TYPES.map(t=>[t,0]))
 }));
 let skipped=0;
 for(const event of session.events){
  const interval=intervals.find(seg=>event.at>=seg.start&&event.at<=seg.end);
  if(!interval){skipped++;continue;}
  const activeAt=interval.offset+event.at-interval.start;
  const index=Math.min(count-1,Math.floor(activeAt/bucketMs));
  const bucket=buckets[index];
  bucket.total++;
  bucket.types[event.type]++;
 }
 const eventsRecorded=session.events.length-skipped;
 const eventsPerHour=activeMs>0?eventsRecorded*3600000/activeMs:0;
 return {
  activeMs,eventsRecorded,skipped,
  eventsPerHour:Number(eventsPerHour.toFixed(2)),
  bucketMs,buckets,
  bestBucket:buckets.reduce((best,b)=>b.total>best.total?b:best,buckets[0]),
 };
}
return Object.freeze({analyze,MAX_BUCKETS});
});
