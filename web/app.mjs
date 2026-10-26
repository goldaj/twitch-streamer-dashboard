import {HEALTH,HealthMonitor} from "../src/health.mjs";
const $=selector=>document.querySelector(selector);
const indicator=$("#indicator"),dot=$("#dot"),label=$("#short-label"),
  title=$("#detail-title"),reason=$("#reason"),diagnostics=$("#diagnostics"),
  source=$("#source"),sound=$("#sound-expected");
const descriptions={
  green:"Stream OK",
  orange:"Problème détecté",
  red:"Stream interrompu",
  gray:"État à vérifier"
};
let monitor=new HealthMonitor();
let scenario="missing";
let everLive=false;
let seenAt=Date.now();
function makeSnapshot(now) {
  const base={
    armed:true,expectedLive:true,wasLive:everLive,soundExpected:sound.checked,
    twitch:{online:true,at:now},
    obs:{streaming:true,reconnecting:false,dropRatio:.002,at:now},
    viewer:{videoPlaying:true,framesAdvancing:true,audioTrack:true,audioActive:true,at:now}
  };
  if(scenario==="ok")everLive=true;
  if(scenario==="no-audio") {everLive=true;base.viewer.audioActive=false;}
  if(scenario==="no-video") {everLive=true;base.viewer.framesAdvancing=false;}
  if(scenario==="reconnect"){everLive=true;base.obs.reconnecting=true;}
  if(scenario==="offline")base.twitch.online=false;
  if(scenario==="missing")base.viewer=null;
  if(scenario==="intentional-stop"){base.expectedLive=false;base.twitch.online=false;}
  return {...base,wasLive:everLive};
}
function render(){
  const now=Date.now();
  const state=monitor.update(makeSnapshot(now),now);
  dot.className="dot "+state.color;
  indicator.setAttribute("aria-label",descriptions[state.color]+": "+state.reason);
  indicator.title=state.reason;
  label.textContent=descriptions[state.color];
  title.textContent=descriptions[state.color];
  reason.textContent=state.reason;
  source.textContent="Cause : "+state.source+" · Simulation uniquement";
  diagnostics.textContent="Scénario : "+scenario+" · "+Math.floor((now-seenAt)/1000)+" s · "+state.reason;
}
document.querySelectorAll("[data-scenario]").forEach(b=>b.addEventListener("click",()=>{
  scenario=b.dataset.scenario;
  // The unexpected-outage scenario assumes the broadcast was previously live.
  if (scenario==="offline") everLive=true;
  seenAt=Date.now();
  document.querySelectorAll("[data-scenario]").forEach(x=>x.classList.toggle("selected",x===b));
  render();
}));
sound.addEventListener("change",render);
render();
setInterval(render,250);
