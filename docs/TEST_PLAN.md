# Protocole de tests — état du 2026-10-26

## Niveau 0 : tests automatiques (sans clé, sans réel stream)
`npm run check && npm test` sur Node 22. Scénarios :
- OAuth Twitch token valide/cache/rejet 401/429 et réponse malformée.
- WebSocket OBS Hello/Identify/Identified/Request/Response avec fausse socket.
- Ratio OBS **différentiel** : premier échantillon inconnu, progression positive, compteur bloqué, compteurs réinitialisés.
- Décisions état Twitch OBS Viewer : vert complet simulé, orange diagnostic, gris mesure perdue, rouge inattendu avec délai, retour vert conditionné.
- Serveur local, absence de secrets côté navigateur, POST d'intention protégé, refus des origines étrangères.
CI sans frais et sans live.

## Niveau 1 : intégration OBS réelle (non réalisée)
1. Activer OBS WebSocket 5 avec mot de passe; renseigner variables d'environnement.
2. OBS inactif : l'interface doit montrer `émission arrêtée` ou inconnu selon Twitch.
3. Démarrer OBS vers un compte de test : vérifier échantillons et progression outputTotalFrames, différences skipped/total.
4. Simuler reconnexion (perte réseau contrôlée) ; confirmer orange si Twitch toujours online.
5. Arrêter volontairement et désarmer : gris, pas rouge.
6. Mesurer activité CPU, reconnect automatique sur redémarrage OBS et erreurs API.

## Niveau 2 : intégration Twitch réelle (non réalisée)
1. Créer app développeur, garder secret uniquement local, définir chaîne réelle contrôlée.
2. Quand non-live, Helix retourne data []; aucune erreur OAuth ne doit devenir `online:false`.
3. Live active : Helix ONLINE et `wasLive=true` lorsqu'armé, date last seen.
4. Coupure inattendue : online -> offline, rouge après délai de confirmation; possible délai **jusqu'à 45s+**, un polling Helix ne garantit pas une alerte instantanée.
5. Rate limit 429, timeout, identifiant erroné, token révoqué : gris.
6. Horodatage de la transition; noter faux positifs/reprise.

## Niveau 3 : réception réelle viewer (recherche, non réalisée)
Voir `docs/VIEWER_PROBE_PLAN.md`. Mesure vidéo et audio côté lecteur réelle, permissions et bruit/silence, publicités et coupures.
Seul ce niveau permettra un **vert crédible**.

## Niveau 4 : expérience visuelle / packaging (non réalisée)
Fenêtre translucide haut droite, always-on-top sur Windows, ne pas inclure par mégarde dans le flux de jeu, couleur+icône/textes et accessibilité. Tester sous jeu plein écran et plusieurs écrans.

**Les chiffres de succès/failure doivent provenir de vrais essais, pas être inventés.**
