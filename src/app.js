(function(){
"use strict";
const $=id=>document.getElementById(id),KEY="stream-desk-v1";
let ctrl=null,channel="";
const ARCHIVE_KEY="stream-desk-archive-v1";
let archive;
try{archive=StreamArchive.create(localStorage.getItem(ARCHIVE_KEY)||undefined);}catch(e){archive=StreamArchive.create();}
function archiveSave(){try{localStorage.setItem(ARCHIVE_KEY,archive.exportJson());}catch(e){status("Impossible d’enregistrer l’archive localement. Exporte-la.");}}
function archiveRender(){const s=archive.summary();$("archive-summary").textContent=s.sessions+" sessions · "+StreamDesk.duration(s.duration)+" · "+s.counts.follow+" follows notés · "+s.counts.subscription+" abonnements notés";$("archive-current").disabled=!ctrl||ctrl.snapshot().status!=="ended";const list=$("archive-list");list.replaceChildren();for(const row of archive.list()){const li=document.createElement("li");const label=document.createElement("span");label.textContent=new Date(row.created).toLocaleDateString("fr-FR")+" · "+row.channel+" · "+StreamDesk.duration(row.duration)+" · "+row.counts.follow+" follows";const button=document.createElement("button");button.textContent="Supprimer";button.addEventListener("click",()=>{if(window.confirm("Supprimer définitivement cette session de l’archive locale ?")){archive.remove(row.id);archiveSave();archiveRender();}});li.append(label," ",button);list.appendChild(li);}}

function status(m){$("message").textContent=m;}
function save(){try{localStorage.setItem(KEY,ctrl.exportJson());}catch(e){status("Stockage inaccessible. Exporter la session pour conserver ses données.");}}
function download(contents,name,type){const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function embeds(){const host=location.hostname;if(!host||!/^https?:$/.test(location.protocol)){status("Twitch nécessite localhost ou HTTPS, pas file://.");return;}
 $("video").src="https://player.twitch.tv/?channel="+encodeURIComponent(channel)+"&parent="+encodeURIComponent(host)+"&muted=true";
 $("chat").src="https://www.twitch.tv/embed/"+encodeURIComponent(channel)+"/chat?parent="+encodeURIComponent(host);
}
function render(){archiveRender();if(!ctrl){$("controls").hidden=true;return;}const s=ctrl.snapshot();
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
$("archive-current").onclick=()=>{if(!ctrl)return;try{const changed=archive.add(ctrl.exportJson());archiveSave();archiveRender();status(changed?"Session archivée.":"Cette session existe déjà dans l’archive.");}catch(e){status(e.message);}};
$("archive-export").onclick=()=>download(archive.exportJson(),"stream-desk-historique.json","application/json");
$("archive-import").onchange=async e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;try{if(file.size>5000000)throw new Error("Fichier trop volumineux");const merged=StreamArchive.create(archive.exportJson());merged.merge(await file.text());archive=merged;archiveSave();archiveRender();status("Historique fusionné sans doublons.");}catch(err){status("Historique non importé : "+err.message);}};
$("new").onclick=()=>{if(ctrl&&["live","paused"].includes(ctrl.snapshot().status)){status("Termine d'abord la session en cours.");return;}ctrl=null;channel="";$("controls").hidden=true;try{localStorage.removeItem(KEY);}catch(e){}status("Entre une chaîne pour créer une session.");};
try{const saved=localStorage.getItem(KEY);if(saved){ctrl=StreamDesk.controller(saved);channel=ctrl.snapshot().channel;$("channel").value=channel;embeds();render();if(ctrl.snapshot().status==="live")status("La session était encore active : pense à la terminer.");}}catch(e){status("Sauvegarde locale illisible.");}
archiveRender();
setInterval(()=>{if(ctrl&&ctrl.snapshot().status==="live")render();},1000);
})();