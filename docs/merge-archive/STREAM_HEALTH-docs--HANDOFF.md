# Passation Codex — Twitch Stream Health Indicator

Dernier cadrage : 2026-10-26, conversation « Avancement_projets_codex_6 ».

## Contrat produit
Voyant discret haut droit : vert = Twitch en ligne + émission correcte + **preuve vidéo/audio depuis une lecture spectateur**; orange = stream online mais défaillance confirmée; rouge = coupure non volontaire après délai; gris = doute/avant live/fin volontaire. Réglage automatique de volume LUFS reporté.

## Travaux GitHub
- Base de cadrage `develop`.
- [PR #1](https://github.com/goldaj/twitch-streamer-dashboard/pull/1) `feat/health-indicator-mvp` : widget fictif et moteur.
- [PR #7](https://github.com/goldaj/twitch-streamer-dashboard/pull/7) `feat/obs-twitch-telemetry` basée sur la branche de PR #1 : collecteurs réels **codés**, sans essai réel avec Twitch ou OBS.
- [Incubateur PR #3](https://github.com/goldaj/projects-incubator/pull/3) a été **fusionnée sur main** (SHA `2bed7a59915aebb51a64672631a5c5b19f2d8e8d`). L'ancienne fiche Twitch et son lien d'index ont été vérifiés absents.
- Tickets : [#2 OBS](https://github.com/goldaj/twitch-streamer-dashboard/issues/2), [#3 Twitch](https://github.com/goldaj/twitch-streamer-dashboard/issues/3), [#4 sonde viewer](https://github.com/goldaj/twitch-streamer-dashboard/issues/4), [#5 package Windows](https://github.com/goldaj/twitch-streamer-dashboard/issues/5), [#6 normalisation audio](https://github.com/goldaj/twitch-streamer-dashboard/issues/6).

## Source / interfaces
- `src/obs-websocket.mjs` : OBS protocol v5 authentication, GetStreamStatus read-only; échantillons différentiels de frames (le premier ne suffit pas); possible statut `framesAdvancing` false si compteur bloqué.
- `src/twitch-helix.mjs` : client_credentials OAuth token côté serveur et GET `/helix/streams?user_login=`, 401 réessayé, 429 => erreur.
- `src/collector.mjs` : polling indépendant OBS 3s, Twitch 10s (backoff quota), source perdue => null et état inconnu, trace `wasLive` seulement après Twitch ONLINE armé.
- `monitor/server.mjs` + `monitor/` : UI de mesures locales, `/api/status` et `/api/intent`; ne sert **aucune** clé ou donnée personnelle de compte, ne capture ni images ni audio.
- `src/health.mjs` : preuve Twitch fraîche 30s, OBS 12s, viewer 12s; rétablissement du vert uniquement si `framesAdvancing:true`, `dropRatio` présent et trois sources complètes.

## Garde-fous et défauts connus
- Sans viewer probe, le vrai voyant ne peut **pas** devenir vert, par conception. La page `web/` demeure simulation; `monitor/` est réelle quand les sources sont configurées.
- **Aucune connexion réelle à OBS ou Twitch n'a été exécutée par ChatGPT**, seuls tests Node avec faux fournisseurs. Ne pas considérer API de production éprouvée.
- La mesure de niveau sonore OBS et la validation audio côté réception restent **à développer** (issue #4). Ne pas inférer le son viewer depuis un compteur d'images.
- Polling Twitch 10s donne alerte après délai variable; EventSub permettrait accélération, mais doit se confirmer sur réseau / compte de test.
- Rester prudent avec false reds lors de fermeture/réouverture de session et environnements multistreams.
- Mode distributeur commercial : éviter d'embarquer `TWITCH_CLIENT_SECRET` dans un binaire desktop, lire `docs/SECURITY.md`.
- Branches liées : ne pas fusionner PR #7 vers la base pendant que Codex modifie PR #1; faire revue et résolution explicite des conflits avant fusion.

## À faire à la reprise
1. Lire `AGENTS.md`, `docs/ADR_0001_SIGNALS.md`, `docs/VIEWER_PROBE_PLAN.md`, `docs/TASKS.md`, `docs/TEST_PLAN.md`, puis historique.
2. Vérifier CI de la tête de PR #7; regarder échecs/test flakiness et corriger.
3. Faire essais OBS et Twitch réels sur machine de test, consigner les mesures sans secrets.
4. Prototyper sonde viewer consentie. **C'est le vrai point de recherche / go-no-go commercial.**
5. À chaque commit, mettre à jour TÂCHES/HANDOFF/HISTORIQUE et vérifier les URLs.

## Fidélité historique
Seuls extraits utilisateur directement visibles sont verbatim, les échanges anciens sont résumés et marqués non verbatim. Aucune « conversation complète » inventée ni données personnelles publiées.

## Nouvel instrument de recherche côté spectateur (code expérimental)
- `/probe/` sur le même serveur local : après clic et autorisation écran/onglet, `getDisplayMedia` fournit vidéo et éventuellement son, l'analyseur WebAudio calcule RMS/dBFS descriptif et ne sauvegarde rien. Tests purs `tests/probe-audio.test.mjs`.
- **Aucune intégration au voyant vert** : le compteur `requestVideoFrameCallback` mesure des frames de capture d'onglet, pas la progression garantie du lecteur Twitch; un onglet peut animer son interface pendant que le stream est figé.
- À tester sur Chrome/Edge récent avec partage audio explicitement activé. La capture peut perturber l'écoute locale; tester hors stream important et ne jamais réinjecter audio au micro/OBS.
- Étape suivante : comparer à des statistiques du lecteur Twitch et à une sonde Chrome `tabCapture` autorisée, puis seulement envisager une confiance de lecture vidéo/audio.
