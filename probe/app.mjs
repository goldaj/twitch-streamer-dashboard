import {rms,summarizeAudioWindow} from "./audio.mjs";

const $=s=>document.querySelector(s);
const start=$("#start"),stop=$("#stop"),state=$("#state"),
  video=$("#preview"),videoStatus=$("#video-status"),audioStatus=$("#audio-status"),
  stats=$("#statistics");
let stream=null,context=null,analyser=null,audioBuffer=null,timer=null;
let frames=0,lastFrames=0,levels=[],hasVideo=false,hasAudio=false;
function stopProbe(){
  if(timer)clearInterval(timer);timer=null;
  const old=stream;stream=null;
  if(old)old.getTracks().forEach(t=>t.stop());
  if(context)void context.close().catch(()=>{});
  context=null;analyser=null;audioBuffer=null;
  video.srcObject=null;start.disabled=false;stop.disabled=true;
  videoStatus.textContent="Capture arrêtée.";
  audioStatus.textContent="Aucune piste audio analysée.";
  state.textContent="Sonde désactivée.";
}
function observeVideo(){
  if(!stream || typeof video.requestVideoFrameCallback!=="function")return;
  video.requestVideoFrameCallback(()=>{
    if(!stream)return;
    frames++;
    observeVideo();
  });
}
function measure(){
  if(!stream)return;
  if(analyser){
    analyser.getFloatTimeDomainData(audioBuffer);
    const sample=rms(audioBuffer);
    if(sample!==null)levels.push(sample);
    if(levels.length>30)levels.shift();
  }
  const summary=summarizeAudioWindow(levels,{minSamples:8});
  const next=frames-lastFrames;lastFrames=frames;
  videoStatus.textContent=hasVideo
    ? "Frames de l'onglet décodées dans cette interface : "+next+"/seconde. Attention : ne prouve PAS la progression du player Twitch."
    : "Aucune piste vidéo.";
  audioStatus.textContent=!hasAudio
    ? "Aucune piste audio partagée. Réessaie en cochant le partage du son de l'onglet."
    : summary.state==="unknown"
    ? "Analyse audio en cours : pas assez d'échantillons."
    : summary.state==="signal"
    ? "Énergie sonore détectée dans l'onglet ("+summary.db+" dBFS environ)."
    : "Silence détecté dans l'onglet ("+summary.db+" dBFS environ). Peut être volontaire.";
  stats.textContent="Observations locales seulement. Aucune preuve d'audibilité sur les enceintes et aucune remontée de mesures au voyant.";
}
start.addEventListener("click",async()=>{
  try{
    // Browser UI gives user exact tab/screen selection and capture permission.
    const selected=await navigator.mediaDevices.getDisplayMedia({
      video:true,audio:true,preferCurrentTab:false
    });
    stopProbe();
    stream=selected;
    hasVideo=selected.getVideoTracks().length>0;
    hasAudio=selected.getAudioTracks().length>0;
    frames=0;lastFrames=0;levels=[];
    video.srcObject=selected;
    await video.play();
    selected.getTracks().forEach(t=>t.addEventListener("ended",stopProbe,{once:true}));
    if(hasAudio){
      context=new AudioContext();
      const source=context.createMediaStreamSource(selected);
      analyser=context.createAnalyser();
      analyser.fftSize=2048;
      source.connect(analyser); // No destination: no forced audio loop/echo.
      audioBuffer=new Float32Array(analyser.fftSize);
      await context.resume();
    }
    if(typeof video.requestVideoFrameCallback!=="function"){
      videoStatus.textContent="Compteur de frames indisponible sur ce navigateur.";
    }else observeVideo();
    timer=setInterval(measure,1000);
    state.textContent="Capture lancée à la demande de l'utilisateur. Rien n'est enregistré.";
    start.disabled=true;stop.disabled=false;
  }catch(error){
    state.textContent="Capture refusée ou interrompue : "+error.message;
    stopProbe();
  }
});
stop.addEventListener("click",stopProbe);
window.addEventListener("pagehide",stopProbe);
