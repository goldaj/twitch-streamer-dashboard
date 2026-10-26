# Backlog et avancement 2026-10-26

| Étape | But | État et preuve |
|---|---|---|
| S0 | Cadrage voyant 4 états, contre les faux verts | **Fait** sur develop |
| S1 | Moteur pur + UI simulateur | **PR #1 draft**, tests Node verts, aucune mesure réelle |
| S2 | Collecte émission OBS WebSocket 5 | **PR #7 draft** : code+tests mock implémentés, **pas test OBS réel** |
| S3 | Twitch Helix Get Streams (poll 10s, gestion 429), OAuth app token | **PR #7 draft** : code+tests mock, **pas test Twitch réel** |
| S4 | Server local, intention streamer, sources exposées en lecture | **PR #7 draft** : code+tests HTTP, UI manuelle requise |
| S5 | Mesure image/son côté viewer | **R&D critique**, non démarrée en code; plan VIEWER_PROBE_PLAN.md |
| S6 | Calibration de seuils, intégration et anti faux-positifs | Non démarré |
| S7 | Overlay streamer seul always-on-top / Windows | Non démarré |
| S8 | UX commerciale et déploiement sécurisé | Non démarré |
| F1 | Normalisation du volume cible LUFS | Backlog futur, issue #6, pas en MVP |

## Prochaines sous-étapes (ordre recommandé)
- S2.1 : examen/validation PR #7 + CI à jour, `npm test`.
- S2.2 : réaliser une vraie connexion OBS 5 read-only et noter versions, latence, ratios, reconnections.
- S3.1 : réaliser une vraie consultation Twitch Helix (avec clé de test **hors Git**).
- S3.2 : simuler sur un vrai stream armé un changement online/offline non prévu, mesurer délai Helix et comparer EventSub.
- S5.1 : expérience manuelle de capture Twitch en onglet avec permission, observer PCM/audio et vidéo côté lecture.
- S5.2 : définir signal de qualité et transport sécurisé des seules métriques viewer -> moteur.
- S6.1 : calibrer couleurs, timing, faux positifs; ensuite seulement emballer un widget Windows.

## Décision commerciale
**Ne pas** annoncer « le voyant garantit que tout le monde voit et entend »; même une sonde viewer ne représente qu'un point de réseau. La valeur commerciale est une alerte indépendante de santé **observée**, avec limites connues.

## S5.0, expérience instrumentée (PR #7)
- `probe/` : sélection manuelle de l'onglet via `getDisplayMedia`, preview visible, métrique RMS/dBFS sur signal audio reçu, frames de l'onglet; aucun stockage ni transmission. **Code seulement, pas testé dans Chrome avec réel stream**.
- Ne pas confondre les frames du **tab capturé** avec les frames **du lecteur Twitch**. Condition `viewer` du moteur reste `null`, même quand cette expérience détecte une énergie sonore.
- Si le modèle est viable en conditions réelles, travailler une sonde plus stricte avec lecteur officiel et/ou extension Chrome consentie. Mesurer faux-positifs avant de connecter au voyant vert.
