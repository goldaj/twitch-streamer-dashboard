# Piste de recherche décisive : vraie observation spectateur

**Objectif :** une preuve de vidéo décodée et un signal audio mesurable **au niveau du lecteur Twitch**, non à l'entrée OBS. Une sonde ne prouve que sa propre expérience, pas celle de tous les viewers.

## Restrictions établies
- Twitch documente `getPlaybackStats` / événements PLAYER pour lecteurs intégrés et impose au player iframe au moins **400×300 pixels**. Pas d'iframe cachée ou rognée pour tromper la mesure.
- L'iframe Twitch appartient à une autre origine ; le JavaScript de notre application ne peut pas librement extraire ses pixels ni son PCM.
- Le player Twitch donne informations lecture/buffer/fps, **pas** une mesure physique des haut-parleurs du spectateur. Capturer la lecture d'un onglet nécessite consentement.
- Chrome `chrome.tabCapture` capture la piste audio/vidéo d'un **onglet que l'utilisateur autorise en invoquant l'extension**. La capture peut couper l'audio local à moins de le rerouter via un `AudioContext`.
- L'échantillonnage audio et vidéo peut faire augmenter CPU / consommation, et toute collecte doit être minimale.

## Comparaison expérimentale
| Option | Avantage | Principal obstacle | Décision |
|---|---|---|---|
| Lecteur Twitch embed visible (400×300) + API JS | Simple, licite si contraintes respectées | Pas d'accès PCM; preuve audio limitée | Baseline vidéo |
| Extension Chrome activée volontairement `tabCapture` sur **onglet Twitch déjà visible** | Accès audio tab et images pour analyse, côté réception | Permissions, latence, tests en conditions réelles, audible output rétabli | Piste R&D prioritaire |
| Retour image/son depuis OBS | Aucun nouveau lecteur | Mesure côté émetteur, invalide comme preuve finale | Diagnostic seulement |
| Seconde machine/tablette spectateur avec lecteur normal | Indépendance réseau et matérielle | Installation/autorisation utilisateur et déplacement | Baseline de vérité terrain |

## Protocole falsifiable
1. Chaîne de test avec streamer consentant; ouvrir Twitch normalement sur une autre machine, sans générer de vues artificielles. Vérifier lecture manuellement.
2. Capturer l'onglet **après clic explicite** et autorisation, conserver le son local via `AudioContext`; enregistrer seulement métriques RMS/LUFS dérivées en mémoire, **jamais audio PCM ni vidéo brute**.
3. Distinguer `videoPlaying` et `framesAdvancing` : utiliser métriques du player officiel + observation du média dans onglet et contrôler un cas de flux figé, écran volontairement statique et onglet actif.
4. `audioTrack` exige une piste audio reçue; `audioActive` se calcule sur une fenêtre de plusieurs secondes **pendant que le streamer a prévu du son**. Mesurer faux orange sur silence intentionnel.
5. Cas de test : source OBS muette, débranchement audio streaming, lecteur buffering, panne réseau de sonde, stream volontairement arrêté, publicité insérée par Twitch, muted volontaire, vidéo figée mais élément d'interface animé.
6. Si extension acceptable : transporter **seulement les métriques** vers le moteur local avec autorisation/authentification, TTL et détection de perte de sonde. Aucun secret d'accès Twitch exposé dans l'extension.
7. Conclure par mesures de délai p95, faux verts/faux oranges, CPU, consommation, qualité expérience spectateur. Si la mesure sur onglet ne suffit pas, **ne pas** ouvrir le vert en production.

## Garde-fou commercial
Le client peut légitimement se demander « est-ce que quelqu'un reçoit bien mon live ? ». On pourra revendiquer « vérifié sur une session de lecture » si c'est prouvé, pas « tous tes spectateurs reçoivent correctement ». L'éventuelle extension est facultative tant que non validée; pas d'installation passive ou surveillance non consentie.

### Sources officielles
- https://dev.twitch.tv/docs/embed/video-and-clips
- https://developer.chrome.com/docs/extensions/reference/api/tabCapture
- https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md

## Spike `getDisplayMedia` (2026-10-26) : ce qui est implémenté
Page `/probe/` côté serveur local. Capture **après clic utilisateur et sélection explicite** de l'onglet Twitch via navigateur, vidéo preview visible, `AudioContext` + `AnalyserNode` (sans destination, pour éviter la boucle d'écho), résumé RMS / dBFS sur environ 8 à 30 relevés, `requestVideoFrameCallback` pour vérifier le flux de capture tab. Tout est en RAM, zéro upload/audio enregistré.

**Aucune conclusion sur la santé du stream Twitch** : une source audio pourrait provenir d'autres éléments du tab; une capture vidéo tab qui avance ne garantit pas que le lecteur Twitch décode effectivement des frames. Le prototype n'envoie donc rien au moteur de santé. Il doit d'abord être essayé et confronté à des pannes contrôlées, avant son intégration future.
