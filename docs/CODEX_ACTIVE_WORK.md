# Codex : travail actif et ordre de reprise

Dernière mise à jour : 2026-10-26 (heure précise non consignée).

## Dépôt et branches
- `main` : dépôt initial, ne pas pousser du code non vérifié directement.
- `develop` : coordination, AGENTS.md, README et histoire du projet.
- [PR #1](https://github.com/goldaj/twitch-streamer-dashboard/pull/1) : `feat/health-indicator-mvp` vers `develop`, moteur déterministe et interface **simulée**.
- [PR #7](https://github.com/goldaj/twitch-streamer-dashboard/pull/7) : `feat/obs-twitch-telemetry` vers `feat/health-indicator-mvp`, **PR empilée**, connecteurs réels codés et instrument expérimental /probe/ (pas encore validés avec un vrai stream).

## Preuve technique à la dernière revue
- Commit tête PR #7 : `9e0135eef6611d30e5dcc3f261847fb871c2a59b`.
- [Actions run 40369099460](https://github.com/goldaj/twitch-streamer-dashboard/actions/runs/40369099460) : `npm run check` + `npm test` **success, 20 tests**. Tous tests fournisseurs OBS/Twitch **simulés**, aucune session authentifiée réelle.
- Intégrations Twitch Helix Get Streams (poll 10 secondes avec backoff 429), OBS WebSocket 5 (handshake authentifié GetStreamStatus, frames comparées sur deux échantillons), collecteur fail-closed, serveur HTTP local, surveillance armée/désarmée.
- `/probe/` : explorateur de capture volontaire d'un onglet, niveau RMS audio; **ni preuve de décodage du player Twitch, ni preuve d'audibilité**, n'alimente pas le voyant vert.

## Note de périmètre pour les reprises ultérieures

La vision produit a été élargie par le propriétaire le 2026-10-26. Voir [STREAMER_SUITE_BACKLOG.md](STREAMER_SUITE_BACKLOG.md) : cockpit de lancement des outils, balance et mesure du son casque/stream, compteurs, subathon, overlay privé, Discord, automatisations Channel Points. **Tout est backlog futur ; le travail actuel des PR #1 et #7 reste prioritaire et ne doit pas être écrasé.**

## Contrat produit prioritaire
Petit voyant streamer-only haut droit : vert **uniquement** avec preuve récente Twitch ONLINE + OBS émission saine + réception vidéo/audio contrôlée sur une vraie sonde viewer. Orange live mais panne constatée; rouge interruption involontaire confirmée; gris manque de preuve ou fin volontaire. **Le vrai voyant reste gris sans sonde viewer.** Normalisation LUFS futur ticket #6.

## Prochaine action Codex
1. Lire le **AGENTS.md de la branche PR #7** puis `docs/HANDOFF.md`, `docs/ADR_0001_SIGNALS.md`, `docs/VIEWER_PROBE_PLAN.md`, `docs/TEST_PLAN.md`, `docs/SECURITY.md` sur la même branche.
2. Vérifier PR #7, CI, risques et contrat de données; aucune fusion implicite. Tester `npm test`.
3. Sur une vraie chaîne contrôlée par le propriétaire et une installation OBS WebSocket 5, faire l'auth avec identifiants uniquement locaux et mesurer la réaction online/offline, reconnect, frames bloquées. Les essais manuels ne sont **pas encore** faits.
4. Sur Chrome, tester `http://127.0.0.1:8767/probe/` avec tab Twitch autorisé, vérifier présence d'audio réellement capturé, faux positifs du compteur vidéo et effets secondaires sur le son; aucun audio/vidéo enregistré.
5. Concevoir la **vraie** sonde spectator compatible Twitch (player visible, non détourné), mesurer faux vert et faux orange, puis seulement lui faire alimenter un état vert réel.
6. Après validation, préparer fenêtre toujours au premier plan, packaging et UX commerciale.

## Incubateur
La [PR #3 de projects-incubator](https://github.com/goldaj/projects-incubator/pull/3) a été **fusionnée** : l'idée Twitch a été retirée de `main` et sa fiche n'y existe plus. Ne pas y réintroduire ce projet démarré.

## Historique
Les documents `docs/CHATGPT_PROJECT_HISTORY.md` des branches ci-dessus sont des archives **partielles** avec verbatim seulement des messages disponibles. Ne pas inventer un verbatim ancien. Conserver instructions et preuves à chaque nouveau commit.
