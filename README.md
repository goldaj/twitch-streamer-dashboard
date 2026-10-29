# Stream Desk Twitch

Tableau de bord de streaming utilisable en local : **lecteur vidéo/chat Twitch officiels**, chronomètre de session, événements notés manuellement, exports JSON/CSV et **historique multi-sessions** avec statistiques cumulées, fusion de sauvegardes et suppression confirmée.

## Démarrer

`python -m http.server 8000` puis `http://localhost:8000/` dans le navigateur. Aucun npm install ni token Twitch nécessaire. Les embeds nécessitent Internet et peuvent demander une connexion Twitch.

Tests : `node --test tests/*.test.cjs`.

**Important :** les métriques de followers, raids et clips sont saisies manuellement ; pas de récupération automatique des événements Twitch. Voir [docs/STREAM_DESK.md](docs/STREAM_DESK.md) pour les détails et la reprise Codex.
