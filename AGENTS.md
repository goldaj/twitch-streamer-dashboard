# Consignes Codex

Lire README.md et docs/STREAM_DESK.md avant intervention. Préserver le caractère local et sans secret du produit. Les indicateurs sont manuels, les embeds officiels Twitch ; ne pas annoncer un accès API live aux métriques. Exécuter node --test tests/*.test.cjs et tester les embeds sur localhost et navigateur. Les futures évolutions prioritaires sont multi-sessions et API OAuth explicitement consentie.

Le module `src/archive.js` conserve un historique multi-sessions exportable. Utiliser les tests `tests/archive.test.cjs` pour valider les fusions non destructives et agrégations. Ne pas mélanger archive et session courante.

## Nouveau chantier 2026-10-29 — chronologie active

Lire `docs/ACTIVE_TIME_ANALYTICS.md`. La branche `feat/active-time-timeline-20261029` est **empilée sur `feat/live-stream-workspace-20261029` PR #8** ; n'interfère pas avec PR #1 (moteur santé simulé) ni PR #7 (OBS/Helix).

- `src/analytics.js` : mesure événements notés par heure de diffusion **hors pauses**, histogramme de 1 à 24 tranches, événements hors segments exclus et signalés.
- `index.html` et `src/app.js` : graphique live, sélection « Analyser » pour les archives, libellés accessibles au clavier.
- `tests/analytics.test.cjs` et workflow existant étendu : tester `node --test tests/*.test.cjs`, `node --check src/analytics.js`, `node --check src/app.js`.
- Ne jamais qualifier des événements manuels de followers/spectateurs réels ; l'intégration OAuth/OBS est séparée et doit avoir sa propre preuve de connexion.
- Vérifier CI puis test navigateur sur localhost avant fusion. Aucun merge automatique.
