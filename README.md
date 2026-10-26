# Twitch Stream Health Indicator

**Produit visé :** voyant très discret en haut à droite, réservé au streamer pendant son live, indiquant si le stream est réellement visible et audible depuis un point de lecture Twitch.

## Signification exacte du voyant
- 🟢 **Vert** : session attendue et active, Twitch confirme ONLINE, OBS confirme l'envoi et progression de ses images, et une sonde spectateur autorisée confirme image et audio reçus, toutes les preuves suffisamment récentes.
- 🟠 **Orange** : Twitch toujours ONLINE, mais dysfonctionnement confirmé sur OBS / image / audio. Pas de vert par déduction.
- 🔴 **Rouge** : Twitch confirme OFFLINE alors que le live était déjà actif et **que le streamer a armé sa surveillance**, après 8 secondes de confirmation. Une fin volontaire ne déclenche pas rouge.
- ⚪ **Gris** : attente, surveillance désarmée, sources incomplètes / indisponibles ou mesures douteuses.

**Actuel :** les connecteurs Twitch Helix et OBS WebSocket ont été codés dans une PR dédiée. **La sonde spectateur n'est pas encore implémentée**, donc le voyant réel ne peut volontairement jamais être vert à ce stade. Un test en ligne sur un véritable stream reste à effectuer. [L'ancien démonstrateur fictif](web/) reste disponible.

## Essayer la surveillance OBS + Twitch sous Windows
Branche : `feat/obs-twitch-telemetry`, PR #7 en brouillon vers la branche du prototype.

Pré-requis : Node.js **22+**, OBS Studio récent avec WebSocket v5, accès au compte développeur Twitch pour créer une app (client ID et client secret). Connexions uniquement en local pour ce POC.

1. Télécharge la branche et ouvre PowerShell **à la racine** du dépôt (Explorateur Windows, `Alt+D`, taper `powershell`, Entrée).
2. Dans OBS, activer `Outils > Paramètres du serveur WebSocket` (habituellement port 4455). **Laisser l'authentification activée**. Ne pas exposer le port sur Internet.
3. Sur https://dev.twitch.tv/console/apps créer une application développeur et récupérer ID / secret. Le statut Helix public utilise un jeton applicatif serveur. **Ce secret ne doit jamais être intégré à un binaire public**. Il est uniquement acceptable pour ce POC local ; voir docs/SECURITY.md.
4. Dans PowerShell :

   ```powershell
   $env:TWITCH_CHANNEL = "NOM_DE_TA_CHAINE"
   $env:TWITCH_CLIENT_ID = "ID_DE_TON_APPLICATION"
   $secret = Read-Host "Twitch Client Secret" -AsSecureString
   $env:TWITCH_CLIENT_SECRET = [System.Net.NetworkCredential]::new("", $secret).Password
   Remove-Variable secret
   $secret = Read-Host "Mot de passe OBS WebSocket" -AsSecureString
   $env:OBS_WEBSOCKET_PASSWORD = [System.Net.NetworkCredential]::new("", $secret).Password
   Remove-Variable secret
   npm test
   npm start
   ```

5. Ouvre **http://127.0.0.1:8767/**. Clique **Armer la surveillance** avant de démarrer le live. Clique **Fin de stream volontaire** lorsque tu l'arrêtes normalement.
6. Les sous-cartes Twitch et OBS indiquent les mesures reçues et leur âge. **Gris demeure normal** tant que le contrôle côté spectateur est absent.
7. Pour tester uniquement l'interface fictive du voyant quatre couleurs, exécute `python -m http.server 8000` depuis la racine, puis ouvre http://127.0.0.1:8000/web/.

Chaque exécution de `npm test` simule les fournisseurs et ne se connecte pas à tes comptes Twitch/OBS. `npm start` utilise réellement les identifiants locaux si présents.

## Structure / méthode
- `src/health.mjs` : décisions vert/orange/rouge/gris, preuves obligatoires, fraîcheur par source, délais de confirmation.
- `src/twitch-helix.mjs` : Helix Get Streams et app-token OAuth côté serveur, polling 45 secondes.
- `src/obs-websocket.mjs` : connexion OBS 5 en lecture seule, authentification challenge, GetStreamStatus toutes les 3 secondes, différentiel d'images.
- `src/collector.mjs` : agrégation et intention de live, dégradation vers gris si connexion perdue.
- `monitor/` : serveur HTTP loopback, API /api/status et /api/intent, interface d'observations **non encore utilisable comme overlay toujours au premier plan**.
- `web/` : démonstrateur **fictif**, sans connexion externe.
- `tests/` : scénarios simulés, CI GitHub Actions, aucune clé nécessaire.

Lire [ADR des signaux](docs/ADR_0001_SIGNALS.md), [plan sonde côté spectateur](docs/VIEWER_PROBE_PLAN.md), [checklist de validation](docs/TEST_PLAN.md), [sécurité / distribution](docs/SECURITY.md), [passation Codex](docs/HANDOFF.md) et [historique des échanges](docs/CHATGPT_PROJECT_HISTORY.md).

## Périmètre futur
La normalisation automatique du volume choisie par le streamer est conservée dans [issue #6](https://github.com/goldaj/twitch-streamer-dashboard/issues/6), avec cible plutôt en **LUFS** et protections true-peak. Elle n'est pas un jalon du premier voyant.

Licence MIT. Aucun historique privé, token, enregistrement de stream ou donnée Twitch personnelle dans Git.
