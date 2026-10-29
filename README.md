# Stream Desk Twitch

Tableau de bord de streaming utilisable en local : **lecteur vidéo/chat Twitch officiels**, chronomètre de session, événements notés manuellement, exports JSON/CSV et **historique multi-sessions** avec statistiques cumulées, fusion de sauvegardes et suppression confirmée.

## Démarrer

`python -m http.server 8000` puis `http://localhost:8000/` dans le navigateur. Aucun npm install ni token Twitch nécessaire. Les embeds nécessitent Internet et peuvent demander une connexion Twitch.

Tests : `node --test tests/*.test.cjs`.

**Important :** les métriques de followers, raids et clips sont saisies manuellement ; pas de récupération automatique des événements Twitch. Voir [docs/STREAM_DESK.md](docs/STREAM_DESK.md) pour les détails et la reprise Codex.

## Chronologie des événements pendant le direct (branche 2026-10-29)

Une nouvelle représentation en barres situe les événements **saisis manuellement** sur la durée **réellement diffusée** (temps des pauses exclu). Dans l'archive, le bouton « Analyser » permet de retrouver la même chronologie pour une session terminée. La cadence « événements notés / heure » ne représente **pas** les statistiques réelles de Twitch.

Code `src/analytics.js`, tests `tests/analytics.test.cjs`, guide [docs/ACTIVE_TIME_ANALYTICS.md](docs/ACTIVE_TIME_ANALYTICS.md). Branche `feat/active-time-timeline-20261029` **empilée sur la PR #8** ; autres PR OBS/Twitch santé (#1/#7) distinctes. Aucun token/API Twitch requis.
