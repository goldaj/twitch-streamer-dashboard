# Stream Desk : régie Twitch locale

## Livré
Tableau de bord responsive avec embeds **officiels** vidéo et chat Twitch, journal de session en temps actif (démarrer, pause, reprendre, terminer), événements manuels (follow, abonnement, raid, clip, marqueur), compteurs et exports JSON/CSV.

## Lancer
À la racine : `python -m http.server 8000`. Ouvrir `http://localhost:8000`, charger une chaîne et démarrer une session. L'intégration Twitch nécessite Internet et le paramètre parent d'un hôte HTTP/HTTPS : `file://` n'est pas compatible.

Les événements sont **saisis à la main**. Ne pas confondre lecteur/chat Twitch officiels avec une intégration Helix, EventSub, OAuth ou une télémétrie de followers en direct. Aucun backend ni clé requise pour l'application. La vidéo et le chat peuvent réclamer une connexion Twitch/cookies tiers.

## Confidentialité et persistance
Les événements et notes sont enregistrés dans le `localStorage` de l'origine. Exporter régulièrement un JSON local, car le navigateur peut effacer son stockage. Le CSV est protégé contre l'injection de formules classiques. Le réimport exige un état cohérent ; un backup marqué « live » est refusé pour éviter une reprise d'horloge incorrecte. Si un onglet reste fermé alors qu'une session est « live », le compteur continue d'utiliser l'horloge murale : terminer la session avant fermeture.

## Tests
`node --test tests/*.test.cjs` sur Node 18+. La CI valide les tests et la syntaxe. Les embeds doivent aussi être testés **réellement sur navigateur** : la CI Node ne simule pas l'authentification ni l'interface Twitch.

## Passation Codex
- Contrôleur pur : `src/core.js` ; interface : `src/app.js`. Ne pas appeler `innerHTML` avec des notes utilisateur.
- Sujets de valeur : enregistrer plusieurs sessions dans un journal historique, visualiser les métriques multi-sessions, ajouter un import/export cumulatif sans perte, intégrer Twitch Helix via OAuth PKCE **optionnel** (sécurité token/consentement), lien explicite avec OBS.
- Éviter d'annoncer des viewers/followers capturés automatiquement tant qu'aucune connexion API autorisée n'existe. Maintenir les tests des transitions et des exports.
- Aucun test visuel complet des embeds n'a été effectué au moment du premier développement.
