# Passation pour Codex — projet Twitch health light

2026-10-26 : dépôt public `goldaj/twitch-streamer-dashboard` créé par le propriétaire. L'idée incubateur était trop sommaire : « interface de supervision de stream, chat et analytics », avec attente de retrouver les maquettes.

**Précision produit actuelle (qui prime)** : un petit témoin de santé, discret et visible en haut à droite pour le streamer, vert si **Twitch live + image réellement décodée côté spectateur + son qui arrive**, orange si Twitch encore live mais panne image/son/émission, rouge si coupure involontaire, gris si inconnu/avant live. La normalisation automatique du volume (réglage par streamer) est explicitement différée.

## Sources confirmées
Documentation officielle Twitch EventSub/Helix, embedded player et contraintes taille/non-obscurcissement, OBS WebSocket 5 et options extension navigateur `tabCapture`. Voir RESEARCH.md. Une API Helix `online` **ne prouve pas que le viewer entend la musique**.

## Priorités immédiates
1. Coder et tester le **moteur de décision** sur données simulées et un widget discret; CI Node (aucun secret).
2. Faire constater les 4 états et événements de défauts.
3. Connecter OBS, Twitch puis une sonde spectateur à autorisations explicites.
4. Mesurer false positives/délais. Un seul viewer probe n'est pas preuve universelle.

## Conventions
Branche `develop` documents, branche `feat/health-indicator-mvp` code, PR **draft**. Ne pas fusionner ni toucher au dépôt `twitch-pokemon-chat-bot` qui est indépendant. Voir AGENTS.md et CHATGPT_PROJECT_HISTORY.md.

## Risques à conserver
Mesure réelle du **son reçu** difficile; musique/capture autorisée seulement; silence volontaire ≠ panne, image statique volontaire ≠ freeze; lecteur Twitch embedded soumis contraintes, aucune sonde « invisible » artificielle. Ne jamais enregistrer ou publier du contenu audiovisuel réel sans autorisation.

## GitHub : travail du 2026-10-26 vérifié
- [PR #1](https://github.com/goldaj/twitch-streamer-dashboard/pull/1) : branche `feat/health-indicator-mvp`, démonstration de voyant et moteur de décision sur observations **fictives**, brouillon non fusionné.
- [CI de PR 40365427678](https://github.com/goldaj/twitch-streamer-dashboard/actions/runs/40365427678) et [CI push 40365363798](https://github.com/goldaj/twitch-streamer-dashboard/actions/runs/40365363798) : **success** Node tests + syntaxe, pas d'API réelle.
- [#2 OBS WebSocket](https://github.com/goldaj/twitch-streamer-dashboard/issues/2), [#3 Twitch Helix/EventSub](https://github.com/goldaj/twitch-streamer-dashboard/issues/3), [#4 sonde viewer](https://github.com/goldaj/twitch-streamer-dashboard/issues/4), [#5 packaging streamer-only](https://github.com/goldaj/twitch-streamer-dashboard/issues/5), [#6 normalisation audio future](https://github.com/goldaj/twitch-streamer-dashboard/issues/6).
- [PR #3 de l'incubateur](https://github.com/goldaj/projects-incubator/pull/3) prépare le retrait de l'idée, brouillon non fusionné.
- **Priorité R&D** : validation de « son et image arrivés côté viewer ». Ne surtout pas promettre un vert crédible via Twitch Online + OBS seuls.
