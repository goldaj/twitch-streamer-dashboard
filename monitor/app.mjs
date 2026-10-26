const $=s=>document.querySelector(s);
const labels={gray:"Vérification incomplète",orange:"Live dégradé",
  red:"Coupure inattendue",green:"Image et son vérifiés"};
function age(x,now){return typeof x==="number"?Math.round((now-x)/1000)+" s":"—";}
function show(data){
  const d=data.decision;
  $("#dot").className="dot "+d.color;
  $("#short-label").textContent=labels[d.color]||"Inconnu";
  $("#reason").textContent=d.reason;
  $("#last").textContent="Dernier calcul : "+new Date(data.at).toLocaleTimeString("fr-FR")+
    " · "+(data.intent.armed?"Surveillance armée":"Surveillance désarmée");
  const t=data.sources.twitch,o=data.sources.obs;
  $("#twitch").textContent=t?(t.online?"Live confirmé":"Hors ligne")+
    " · relevé "+age(t.at,data.at):data.errors.twitch||"Non mesuré";
  $("#obs").textContent=o?(o.streaming?"Émission active":"Émission arrêtée")+
    (o.reconnecting?" · reconnexion":"")+
    (typeof o.dropRatio==="number"?" · pertes "+(100*o.dropRatio).toFixed(1)+" %":"")+
    " · relevé "+age(o.at,data.at):data.errors.obs||"Non mesuré";
  $("#viewer").textContent="Non mesuré : image et audio non vérifiés";
}
async function poll(){
  try{
    const response=await fetch("/api/status",{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    show(await response.json());
  }catch(error){
    $("#dot").className="dot gray";
    $("#short-label").textContent="Monitoring inaccessible";
    $("#reason").textContent="Serveur local indisponible : "+error.message;
  }
}
async function intent(armed){
  try{
    const response=await fetch("/api/intent",{
      method:"POST",headers:{"Content-Type":"application/json","X-Local-Control":"stream-health"},
      body:JSON.stringify({armed})
    });
    if(!response.ok)throw new Error("HTTP "+response.status);
    show(await response.json());
    $("#message").textContent=armed?"Surveillance armée. Aucune conclusion verte sans sonde viewer.":"Fin volontaire enregistrée.";
  }catch(error){$("#message").textContent="Échec : "+error.message;}
}
$("#arm").addEventListener("click",()=>intent(true));
$("#disarm").addEventListener("click",()=>intent(false));
poll();setInterval(poll,1000);
