# Product brief — Twitch Stream Health Indicator

## Cible utilisateur
Un streamer veut savoir **pendant son émission** si les personnes à l'autre bout reçoivent bien l'image et le son. Un cercle discret (coin haut droit, réglable plus tard) affiche l'état sans masquer l'interface. Le détail apparaît au survol/clic, option alertes sonores et historique ensuite.

## Signification (contrat)
- **Vert** : session volontaire active; Twitch confirmé live; envoi correct d'après OBS; sonde de lecture côté viewer positive sur décodage vidéo **et** signal audio, avec preuves récentes. Ce niveau de confiance doit être explicite.
- **Orange** : live Twitch toujours confirmé, mais panne vraisemblable (OBS reconnecte, perte majeure de frames, lecture vidéo bloquée, piste audio absente ou niveau de sortie anormalement bas pendant une période où du son est attendu).
- **Rouge** : interruption **involontaire** du live confirmée après délai de grâce (intent armé, diffusion précédemment active, Twitch offline). Pas de rouge pour un arrêt volontaire.
- **Gris** : surveillance désarmée, avant live ou télémétrie indisponible / contradictoire. Ne jamais déclarer une panne si l'absence de preuve peut être un incident de sonde.

## Variables complémentaires
- Alarme orange sans audio : silence réel mais volontaire (pause, jeu silencieux) => le contrôle d'audibilité sera conditionné à la configuration « son attendu »; vérifier piste, mute, audio RMS/LUFS plutôt qu'une seule observation.
- Image fixe voulue vs flux bloqué : mesurer progression du décodage / frames, pas simplement différence entre deux pixels.
- Diffusion via un autre logiciel qu'OBS : OBS est notre premier adaptateur, mais pas une condition nécessaire à tous les futurs utilisateurs.
- Plusieurs viewers peuvent avoir des problèmes réseaux individuels. Un seul point de lecture prouve seulement cette vantage, pas la réception universelle.

## First release : MVP étroit
- Voyant haut droit + panneau détail, 4 états et raisons + date dernière vérification.
- Armer / désarmer surveillance et simulation des cas en mode développement.
- Réactivité ajustée avec anti-rebond (secondes configurables).
- Pas de fausses promesses : dès qu'un signal requis est absent, état gris.
- Brancher en priorité les vraies sources qui rendent **vert crédible**.

## Future functionality — explicitly deferred
Normalisation automatique du volume sortant selon une cible choisie par le streamer (mesure en **LUFS intégrés / short-term** et contrôle des vrais pics en dBFS / true peak, avec limiteur, réglages de latence/gain), puis éventuellement fonctionnalités de gestion du stream, chat et analytics. **Ne pas implémenter cela en P0.**
