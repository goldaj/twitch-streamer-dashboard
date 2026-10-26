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
