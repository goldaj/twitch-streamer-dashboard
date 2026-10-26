/**
 * Health decisions need evidence measured from three independent vantage points:
 * Twitch, broadcaster OBS, and a viewer-side probe.
 *
 * This file deliberately makes NO network requests. No simulated evidence is a
 * guarantee of real Twitch quality. All timestamps use milliseconds.
 */
export const HEALTH = Object.freeze({
  HEALTHY: "green",
  DEGRADED: "orange",
  INTERRUPTED: "red",
  UNKNOWN: "gray"
});

const DEFAULTS = Object.freeze({
  staleAfterMs: 15_000, // legacy override / compatibility
  twitchStaleAfterMs: 90_000, // Helix polled every 45 seconds
  obsStaleAfterMs: 12_000, // OBS polled every 3 seconds
  viewerStaleAfterMs: 12_000,
  redConfirmMs: 8_000,
  degradeConfirmMs: 2_000,
  recoverConfirmMs: 3_000,
  maxDropRatio: 0.08
});

export function assess(snapshot, now, overrides={}) {
  const cfg={...DEFAULTS,...overrides};
  const result=(color,reason,source)=>({color,reason,source});
  if(!Number.isFinite(now)) throw new RangeError("Horloge invalide");
  if(!snapshot?.armed) return result(HEALTH.UNKNOWN,"Surveillance non armée","configuration");
  if(!snapshot.expectedLive) return result(HEALTH.UNKNOWN,"Stream volontairement arrêté ou pas encore lancé","configuration");
  const twitch=snapshot.twitch, obs=snapshot.obs,viewer=snapshot.viewer;
  const fresh=(signal,maxAge)=>signal && Number.isFinite(signal.at) &&
    signal.at<=now && now-signal.at<=maxAge;
  if(!fresh(twitch,cfg.twitchStaleAfterMs)) return result(HEALTH.UNKNOWN,"Statut Twitch absent ou périmé","twitch");
  if(twitch.online===false) {
    if(snapshot.wasLive) return result(HEALTH.INTERRUPTED,"Stream Twitch hors ligne alors qu'il devait continuer","twitch");
    return result(HEALTH.UNKNOWN,"Twitch est hors ligne, démarrage encore non confirmé","twitch");
  }
  if(twitch.online!==true) return result(HEALTH.UNKNOWN,"Statut Twitch inconnu","twitch");
  if(!fresh(obs,cfg.obsStaleAfterMs)) return result(HEALTH.UNKNOWN,"État de l'encodeur absent ou périmé","obs");
  if(obs.streaming===false || obs.reconnecting===true)
    return result(HEALTH.DEGRADED,"Émission OBS arrêtée ou en reconnexion, mais Twitch encore live","obs");
  if(obs.streaming!==true) return result(HEALTH.UNKNOWN,"État OBS indéterminé","obs");
  if(obs.framesAdvancing===false)
    return result(HEALTH.DEGRADED,"Aucune nouvelle image comptée par OBS","obs");
  if(obs.framesAdvancing!==true)
    return result(HEALTH.UNKNOWN,"Progression des images OBS non vérifiée","obs");
  if(Number.isFinite(obs.dropRatio) && obs.dropRatio>=cfg.maxDropRatio)
    return result(HEALTH.DEGRADED,"Pertes importantes d'images pendant l'envoi","obs");
  if(!Number.isFinite(obs.dropRatio) || obs.dropRatio<0 || obs.dropRatio>1)
    return result(HEALTH.UNKNOWN,"Métriques de pertes OBS pas encore disponibles","obs");
  if(!fresh(viewer,cfg.viewerStaleAfterMs)) return result(HEALTH.UNKNOWN,"Aucune sonde de lecture spectateur récente","viewer");
  if(viewer.videoPlaying===false || viewer.framesAdvancing===false)
    return result(HEALTH.DEGRADED,"Vidéo non lue ou décodage bloqué sur la sonde","viewer");
  if(viewer.audioTrack===false) return result(HEALTH.DEGRADED,"Piste audio absente côté sonde","viewer");
  if(snapshot.soundExpected && viewer.audioActive===false)
    return result(HEALTH.DEGRADED,"Aucun signal audio côté sonde alors que du son est attendu","viewer");
  if(viewer.videoPlaying!==true || viewer.framesAdvancing!==true ||
      viewer.audioTrack!==true || (snapshot.soundExpected && viewer.audioActive!==true))
    return result(HEALTH.UNKNOWN,"Lecture image/son pas entièrement vérifiée","viewer");
  return result(HEALTH.HEALTHY,"Live, vidéo et son vérifiés sur une sonde","all");
}

/**
 * Four-state debounce. Delays only transition to red/green/orange; if a valid
 * green loses proof or receives a red candidate, show gray immediately until
 * confirmation, never continue reporting green without evidence.
 */
export class HealthMonitor {
  constructor(config={}){
    this.config={...DEFAULTS,...config};
    this.pending=null;
    this.pendingSince=null;
    this.current={color:HEALTH.UNKNOWN,reason:"En attente",source:"system"};
  }
  update(snapshot,now){
    const candidate=assess(snapshot,now,this.config);
    if(candidate.color===HEALTH.UNKNOWN){
      this.pending=null;this.pendingSince=null;this.current=candidate;return this.current;
    }
    if(this.current.color===candidate.color){
      this.pending=null;this.pendingSince=null;this.current=candidate;return this.current;
    }
    if(this.pending!==candidate.color || !Number.isFinite(this.pendingSince) || now<this.pendingSince){
      this.pending=candidate.color;this.pendingSince=now;
    }
    const hold=candidate.color===HEALTH.INTERRUPTED?this.config.redConfirmMs:
      candidate.color===HEALTH.HEALTHY?this.config.recoverConfirmMs:
      this.config.degradeConfirmMs;
    if(now-this.pendingSince>=hold){
      this.current=candidate;this.pending=null;this.pendingSince=null;return this.current;
    }
    // Awaiting confirmation: always represent the verification gap explicitly.
    return {
      color:HEALTH.UNKNOWN,
      reason:"Vérification en cours : "+candidate.reason,
      source:candidate.source
    };
  }
}
