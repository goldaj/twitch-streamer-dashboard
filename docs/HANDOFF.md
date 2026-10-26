# Codex : relais MVP voyant de santé

- Branche `develop` : README, AGENTS et documents de preuve/besoin.
- Branche `feat/health-indicator-mvp` : **moteur pur** de classification `src/health.mjs`, tests Node, interface HTML/CSS/JS sans dépendances simulant les incidents, CI.
- Respecter impérativement 4 niveaux vert/orange/rouge/gris. **Vert uniquement** quand Twitch live + OBS bon + vidéo audio côté spectateur vérifiés par signes positifs **frais**.
- Le prototype actuel utilise des **observations fictives**, aucune connexion Twitch/OBS/sonde. Il n'est pas vendable ni capable de signaler un vrai incident.
- Rouge après grâce 8 s pour interruption involontaire, vert après 3 s de confirmation, orange après 2 s (configurable, hypothèses non calibrées).
- Silence volontaire n'est pas une panne; `soundExpected` doit être paramétré, le niveau audio final nécessite un test réel.
- Orange si Twitch encore up mais OBS reconnecte, pertes importantes, playback image ou audio déficients.
- Quand manque de preuve ou non armé : gris (jamais un faux vert).
- Vérifier scénarios Chrome, puis connecter OBS WebSocket, Helix/EventSub, et **une sonde viewer consentie**.
- Aucun secret dans Git; pas d'embed Twitch caché (restrictions officielles); pas de consommation de faux viewers.
- Future feature **hors sprint** : normalisation automatique de loudness (LUFS) réglable par streamer avec limiteur et calibration; ne pas coder avant MVP.
- À chaque reprise : lire AGENTS.md, PRODUCT, RESEARCH, TASKS, historique et mettre à jour preuves/tests.
