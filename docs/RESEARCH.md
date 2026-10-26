# Recherche de faisabilité et restrictions — 2026-10-26

## Preuves des couches techniques

1. **État Twitch** : EventSub stream.online / stream.offline (notifications) et Helix Get Streams (polling). C'est un indicateur d'existence, **pas une preuve des pixels/sons distribués**. Source officielle : https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types et https://dev.twitch.tv/docs/api/reference#get-streams
2. **Émission OBS** : obs-websocket 5 expose GetStreamStatus (`outputActive`, `outputReconnecting`, `outputSkippedFrames`, `outputTotalFrames`, `outputCongestion`) et GetStats, événements `InputVolumeMeters`. Ces mesures portent sur la machine émettrice, pas le casque du viewer. Source : https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md
3. **Lecture Twitch** : API du lecteur intégré Twitch (événements PLAYING, OFFLINE, PLAYBACK_BLOCKED, getPlaybackStats avec bufferSize, fps, playbackRate, codecs, skippedFrames, latence). Mais **pas de mesure directe garantissant son audibilité ni l'activité réellement décodée par un viewer**. Sources : https://dev.twitch.tv/docs/embed/video-and-clips et https://dev.twitch.tv/docs/embed/
4. **Restrictions embed** : taille minimale de player 400×300, visible/non recouvert; autoplay bloqué dans certaines circonstances. **Interdit de prétendre faire une sonde invisible en réduisant/masquant un lecteur intégré.** Source : https://dev.twitch.tv/docs/embed/
5. **Piste de sonde permissionnée** : extension navigateur `chrome.tabCapture` (uniquement après geste d'utilisateur) donnant audio+vidéo du **vrai onglet de lecture Twitch**. Cela permettrait de mesurer le flux reçu depuis l'onglet, pas la sortie physique des enceintes. À prouver en prototype avec permissions, respect de la confidentialité et restore playback. Source : https://developer.chrome.com/docs/extensions/reference/api/tabCapture
6. **Produits existants** : Twitch Inspector, qui fournit des indicateurs santé/bitrate émetteur mais n'est pas un voyant autonome prouvant image+son côté viewer : https://help.twitch.tv/s/article/guide-to-using-twitch-inspector ; OBS Online Status extension (frame-drop overlay), périmètre plus étroit : https://obsproject.com/forum/resources/online-status-%E2%80%93-automatic-dropped-recovered-frames-overlay.2211/

## Conclusion scientifique
- Le plus gros risque du produit n'est pas le dessin d'une pastille, mais **la vérification bout en bout** sans solution magique ou altération des vues.
- Construire d'abord une **machine à états testable**, puis trois adaptateurs OBS/Twitch/viewer.
- Séparer **émetteur actif, Twitch en direct, lecture vidéo réelle, son côté réception**; aucun d'eux ne garantit à lui seul l'expérience de tous les viewers.
- Les seuils doivent être calibrés en conditions de streaming réelles, en documentant faux positifs, délai de détection et cas limites (silence/pause écran).
- Évaluer ultérieurement un observateur dédié sur un autre appareil ou une extension Chrome consentie. Ce n'est pas une source implémentée dans la première tranche.

## Contraintes produits/monétisation
Twitch Developer Agreement, limites API, OAuth, vie privée, autorisations audio, comportement du player officiel, conditions d'usage à vérifier avant publication d'un service. Ne pas distribuer un bot créant de fausses vues ou un player invisible.
