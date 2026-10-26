# Backlog actif — seulement le voyant de santé

| Phase | Tâche | État |
|---|---|---|
| S0 | Fiche produit vert/orange/rouge/gris, promesse réaliste | Documenté |
| S1 | Machine à états, hysteresis, signaux horodatés et tests | À coder sur branche dédiée |
| S2 | Mini voyant haut droit, survol détail, simulation reproductible | À coder sur branche dédiée |
| S3 | Connecteur OBS WebSocket (streaming, reconnect, drop ratio, état audio) | À faire |
| S4 | Connecteur Twitch Helix/EventSub pour live/offline | À faire |
| S5 | Sonde *réelle* côté viewer et mesure de présence de média | R&D critique |
| S6 | Calibration en live (silences, contenus statiques, réseau dégradé) | À faire |
| S7 | Fenêtre always-on-top streamer uniquement, packaging Windows | À faire |
| S8 | Diffusion et validation commerciale du produit minimal | À faire |

## Suite de modules hors périmètre actif

Le propriétaire a précisé une vision de cockpit streamer avec **7 futurs modules** documentés en détail dans [STREAMER_SUITE_BACKLOG.md](STREAMER_SUITE_BACKLOG.md) : launcher, audio multi-sources et monitoring casque/stream, chrono configurable, compteur subathon, overlay privé, Discord simplifié et règles de récompenses Channel Points. La pastille santé reste SH/P0. Ne pas créer de tâches de code ni réordonner S0–S8 à partir de ce document avant la validation du MVP et des arbitrages de priorité.

## Acceptation
- Orange si Twitch live mais vidéo/son ou émission dégradée confirmée; rouge seulement sur coupure live involontaire après un délai de grâce; vert seulement si preuves positives récentes y compris sonde réelle; gris si observation indisponible.
- Survol/clic pour nommer explicitement la panne et la source.
- Pas de dispositif déguisé en lecteur Twitch caché.
- Aucun statut présenté comme vrai avant connexion effective de Twitch + OBS + viewer probe.
- Conserver règle de passation ChatGPT/Codex, ne jamais fusionner automatiquement.
