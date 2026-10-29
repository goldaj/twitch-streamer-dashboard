(function(){
"use strict";
const $=id=>document.getElementById(id),KEY="stream-desk-v1";
let ctrl=null,channel="";
function status(m){$("message").textContent=m;}
function save(){try{localStorage.setItem(KEY,ctrl.exportJson());}catch(e){status("Stockage inaccessible. Exporter la session pour conserver ses données.");}}
function download(contents,name,type){const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function embeds(){const host=location.hostname;if(!host||!/^https?:$/.test(location.protocol)){status("Twitch nécessite localhost ou HTTPS, pas file://.");return;}
 $("video").src="https://player.twitch.tv/?channel="+encodeURIComponent(channel)+"&parent="+encodeURIComponent(host)+"&muted=true";
 $("chat").src="https://www.twitch.tv/embed/"+encodeURIComponent(channel)+"/chat?parent="+encodeURIComponent(host);
}
function render(){if(!ctrl){$("controls").hidden=true;return;}const s=ctrl.snapshot();
 $("controls").hidden=false;$("timer").textContent=StreamDesk.duration(s.elapsedMs);$("state").textContent=s.status;
 for(const t of StreamDesk.TYPES)$("count-"+t).textContent=s.counts[t];
 $("start").disabled=!["idle","paused"].includes(s.status);$("pause").disabled=s.status!=="live";$("finish").disabled=!["live","paused"].includes(s.status);
 document.querySelectorAll("[data-event]").forEach(b=>b.disabled=s.status!=="live");
 const list=$("events");list.replaceChildren();
 for(const e of s.events.slice(-60).reverse()){const li=document.createElement("li");li.textContent=new Date(e.at).toLocaleTimeString("fr-FR")+" · "+e.type+" · "+e.note;list.appendChild(li);}
}
function act(fn){try{fn();save();render();status("Action enregistrée.");}catch(e){status(e.message);}}
function load(){try{const name=$("channel").value;const state=ctrl?.snapshot();if(state&&["live","paused"].includes(state.status)&&state.channel!==name.trim().toLowerCase())throw new Error("Termine la session avant de changer de chaîne.");
 if(!state||state.channel!==name.trim().toLowerCase()||state.status==="ended")ctrl=StreamDesk.controller(StreamDesk.newSession(name));
 channel=ctrl.snapshot().channel;$("channel").value=channel;embeds();save();render();status("Chaîne chargée.");}catch(e){status(e.message);}}
$("load").onclick=load;$("channel").addEventListener("keydown",e=>{if(e.key==="Enter")load();});
$("start").onclick=()=>act(()=>ctrl.start());$("pause").onclick=()=>act(()=>ctrl.pause());$("finish").onclick=()=>act(()=>ctrl.finish());
document.querySelectorAll("[data-event]").forEach(b=>b.onclick=()=>act(()=>{ctrl.record(b.dataset.event,$("note").value);$("note").value="";}));
$("json").onclick=()=>ctrl&&download(ctrl.exportJson(),"stream-"+channel+".json","application/json");
$("csv").onclick=()=>ctrl&&download(StreamDesk.csv(ctrl.exportJson()),"stream-"+channel+".csv","text/csv");
$("import").onchange=async e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;try{if(file.size>1000000)throw new Error("Fichier trop volumineux");
 const imported=StreamDesk.controller(await file.text());if(imported.snapshot().status==="live")throw new Error("Une session active ne peut pas être réimportée");
 ctrl=imported;channel=ctrl.snapshot().channel;$("channel").value=channel;embeds();save();render();status("Sauvegarde importée.");}catch(err){status("Import refusé : "+err.message);}};
$("new").onclick=()=>{if(ctrl&&["live","paused"].includes(ctrl.snapshot().status)){status("Termine d'abord la session en cours.");return;}ctrl=null;channel="";$("controls").hidden=true;try{localStorage.removeItem(KEY);}catch(e){}status("Entre une chaîne pour créer une session.");};
try{const saved=localStorage.getItem(KEY);if(saved){ctrl=StreamDesk.controller(saved);channel=ctrl.snapshot().channel;$("channel").value=channel;embeds();render();if(ctrl.snapshot().status==="live")status("La session était encore active : pense à la terminer.");}}catch(e){status("Sauvegarde locale illisible.");}
setInterval(()=>{if(ctrl&&ctrl.snapshot().status==="live")render();},1000);
})();