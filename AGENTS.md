# Consignes Codex

Lire README.md et docs/STREAM_DESK.md avant intervention. Préserver le caractère local et sans secret du produit. Les indicateurs sont manuels, les embeds officiels Twitch ; ne pas annoncer un accès API live aux métriques. Exécuter node --test tests/*.test.cjs et tester les embeds sur localhost et navigateur. Les futures évolutions prioritaires sont multi-sessions et API OAuth explicitement consentie.

Le module `src/archive.js` conserve un historique multi-sessions exportable. Utiliser les tests `tests/archive.test.cjs` pour valider les fusions non destructives et agrégations. Ne pas mélanger archive et session courante.
