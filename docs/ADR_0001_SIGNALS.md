# ADR-0001 : preuves de santé et sécurité des couleurs

Date : 2026-10-26. **Statut : accepté pour prototype ; seuils à calibrer sur un vrai stream**.

## Hypothèse produit
Un voyant peut être vendu s'il réduit effectivement le temps de détection des pannes et minimise les faux positifs. Un simple `stream.online` ne suffit pas.

## Ontologie des observations
| Source | Mesure | Prouve | Ne prouve pas |
|---|---|---|---|
| Twitch Helix / EventSub | ONLINE/OFFLINE | stream déclaré diffusé | frames lisibles, audio, qualité chaque réseau |
| OBS WebSocket 5 | `outputActive`, `outputReconnecting`, compteurs de frames | émission locale, progression encodeur | médias reçus par Twitch/viewer |
| Probe viewer | lecture et décodage + audio reçu | lecture depuis **un** point d'observation | que tous les spectateurs voient/entendent |
| Intention du streamer | armé, déjà vu live, arrêt volontaire | distinguer panne et fin normale | diffusion réussie |

## Invariants codés
1. Vert exige **trois sources fraîches** et un contrôle viewer vidéo+audio positif. Aucun mécanisme de preview ne le remplace.
2. Orange pour dégradation confirmée malgré Twitch online (reconnexion, frames bloquées, pertes; plus tard silence si son attendu).
3. Rouge seulement si un live précédemment observé devient offline malgré surveillance armée et délai de confirmation.
4. Gris si preuve périmée, non disponible ou session désarmée.
5. Dans l'anti-rebond, on n'affiche pas le dernier vert pendant la confirmation d'une panne potentielle; transition temporairement grise.
6. Arrêt volontaire = désarmement explicite, et non couleur rouge.

## Choix d'échantillonnage
- Twitch : polling Helix 45 s, preuve conservée au plus 90 s. EventSub sera complément, pas obligatoire pour v0.
- OBS : polling 3 s, fenêtre TTL 12 s. `outputSkippedFrames / outputTotalFrames` sont des compteurs depuis le début du stream : **différentiel** sur deux relevés uniquement, sinon gris initial. L'absence de progression de frames donne orange si OBS actif et Twitch online.
- Viewer : TTL 12 s à définir et valider avec vrai instrument de mesure. Silence volontaire important : le signal audio `audioActive` requiert configuration `soundExpected` et fenêtre temporelle.
- Confirmation couleurs proposées : rouge 8 s, orange 2 s, retour vert 3 s. Ce ne sont **pas** des limites démontrées.

## Alternatives écartées
- Vert basé uniquement sur « ONLINE » : **rejeté**, n'apporte pas la promesse commerciale.
- Capturer directement audio/vidéo de Twitch sans permission/avec player invisible : **rejeté**.
- État rouge lors de chaque offline : **rejeté**.
- Conclure panne son à partir d'une seconde de silence : **rejeté**.

## Décision en suspens
Comment produire la première sonde viewer consentie et conforme avec niveau audio décodable ? Voir `docs/VIEWER_PROBE_PLAN.md`. Un navigateur ne peut pas analyser librement le contenu d'une iframe Twitch cross-origin.
