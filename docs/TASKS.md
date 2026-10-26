# Backlog voyant Stream Health — 2026-10-26

| Phase | Travail | État |
|---|---|---|
| S0 | Vision vert/orange/rouge/gris, sources et garde-fous | **Cadré** sur develop |
| S1 | Moteur pur d'états horodatés, confirmation et tests | **Code sur PR draft**, CI à lire, pas d'API réelle |
| S2 | Voyant discret haut droit, causes, simulation incidents | **Code sur PR draft**, navigateur réel non testé |
| S3 | Connecteur OBS WebSocket 5 | À faire, capturer émission et niveau audio |
| S4 | Connecteur Twitch Helix/EventSub | À faire, respecter quotas/auth |
| S5 | Sonde réelle côté spectateur (audio+vidéo) | Recherche critique, pas de player caché |
| S6 | Calibration en vrais streams et robustesse | À faire, éliminer faux positifs |
| S7 | Widget toujours au premier plan streamer + packaging Windows | À faire |
| S8 | Publication produit | À faire après vraie preuve |

## Prochaines sous-étapes
1. Vérifier CI sur PR `feat/health-indicator-mvp`, `npm test` puis démarrer `python -m http.server 8000` pour `/web/`.
2. Vérifier les états simulés : orange audio/video/reconnexion, rouge après délai si coupure inattendue, gris si télémétrie absente/fin volontaire, vert seulement si preuves simulées complètes.
3. Construire le connecteur **OBS** puis Twitch; enregistrer limites « émetteur vs réception ».
4. Prototyper sonde viewer **consentie**, avec preuve média décodé, pas compteur d'OBS.
5. Mesurer taux de fausses alertes et latence; seulement alors remplacer la démo.
