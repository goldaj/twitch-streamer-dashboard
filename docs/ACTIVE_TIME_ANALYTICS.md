# Chronologie d'activité d'une diffusion — 29 octobre 2026

## Fonctionnalité

Le tableau de bord enregistre des événements **manuellement** : follow, abonnement, raid, clip et marqueurs. Jusqu'ici, il affichait seulement la liste récente et des compteurs. La nouvelle vue « Chronologie du direct » montre **quand** ces événements sont arrivés pendant le temps réellement diffusé.

- Le temps actif est calculé à partir des segments `start`/`pause`/`resume`/`finish` de la session ; les pauses n'entrent ni dans le chronomètre analytique, ni dans les tranches.
- Chaque barre représente une tranche de temps actif, d'au moins une minute. La granularité augmente pour les longues sessions, avec **24 barres maximum**.
- La synthèse affiche le nombre d'événements manuels enregistrés et leur fréquence par heure diffusée. Attention : il ne s'agit **ni des vrais nouveaux followers Twitch, ni de spectateurs live, ni de statistiques automatiques**.
- L'archive multi-sessions existante comporte un bouton **Analyser** par session terminée : affichage de la chronologie et des mêmes mesures, sans réouvrir/modifier la session.
- Les données d'une session dont l'horodatage se situe *hors* de ses segments actifs sont **ignorées** dans les statistiques et comptabilisées séparément, pour ne pas déformer les résultats.
- Les graphiques sont DOM/HTML natifs avec titres et libellés d'accessibilité au clavier. Pas de dépendance externe ni de token.

## Mise en route

```bash
python -m http.server 8000
# puis http://localhost:8000/
node --test tests/*.test.cjs
```

Sur l'interface, choisir une chaîne, démarrer une session, saisir quelques événements, mettre en pause, reprendre, terminer puis archiver. Cliquer sur « Analyser » dans la liste d'archives.

## Tests et limites

Les tests Node `tests/analytics.test.cjs` vérifient le calcul sans périodes de pause, la position des événements dans les tranches, le filtrage des événements incohérents, une session live et le plafonnement de la granularité. La CI valide la syntaxe de `src/analytics.js` et `src/app.js`.

Les **tests de calcul ne garantissent pas le rendu visuel**, la compatibilité des embeds Twitch ni la conservation des données dans tous les navigateurs. Exécuter un test réel sur navigateur, notamment en petite résolution. Les événements restent saisis manuellement et le stockage reste `localStorage`, sans synchronisation automatique.

## Reprise Codex

1. Lire `README.md`, `AGENTS.md`, `docs/STREAM_DESK.md` et cette note. La PR est empilée sur **#8**, branche `feat/live-stream-workspace-20261029`. Ne pas fusionner directement vers `main` avant sa base.
2. Les branches `feat/health-indicator-mvp` et `feat/obs-twitch-telemetry` portent des travaux **distincts** (PR #1 et #7), à ne pas fusionner par inadvertance. Aucune preuve de santé audiovisuelle réelle n'est fournie par cette nouvelle chronologie.
3. Tester visuellement 0, 1, 24+ tranches et 100 sessions archivées ; vérifier l'accessibilité clavier, la lisibilité mobile et la validité des imports.
4. Poursuivre avec de vraies télémétries uniquement avec accord OAuth/OBS explicite ; les nommer distinctement des événements manuels. Ne pas créer des métriques de viewers ou de followers fictives.
5. Étude de valeur prochaine : corrélation des marqueurs manuels avec clips/raids et comparaison inter-sessions sans prétendre à une causalité.
