/**
 * Descriptive audio measurements only. Not a proof of audio audibility on
 * physical loudspeakers or of intended music during deliberate silence.
 */
export function rms(samples){
  if(!samples || !samples.length)return null;
  let sum=0;
  for(const sample of samples){
    if(!Number.isFinite(sample))return null;
    sum+=sample*sample;
  }
  return Math.sqrt(sum/samples.length);
}
export function dbfs(linear){
  if(!Number.isFinite(linear) || linear<0)return null;
  return linear===0?-Infinity:20*Math.log10(linear);
}
export function summarizeAudioWindow(levels,{thresholdDb=-45,minSamples=10}={}){
  if(!Array.isArray(levels) || levels.length<minSamples ||
    levels.some(x=>!Number.isFinite(x) || x<0))return {state:"unknown",db:null};
  const sorted=levels.slice().sort((a,b)=>a-b);
  // upper quartile avoids declaring sound absent because of one quiet interval.
  const representative=sorted[Math.floor(sorted.length*.75)];
  const value=dbfs(representative);
  return {state:value>=thresholdDb?"signal":"silence",
    db:Number.isFinite(value)?Math.round(value*10)/10:value};
}
