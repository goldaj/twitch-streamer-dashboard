# Reprise Twitch Streamer Dashboard — consolidation du 29 octobre 2026

**PR d'évolution unique :** [#7](https://github.com/goldaj/twitch-streamer-dashboard/pull/7) → `main`.

Le bureau de stream, chronologie d'activité et archivage multi-sessions de l'ancienne PR #9 sont déjà dans `main` (CI verte avant fusion). Le moteur d'état OBS/Twitch, la sonde audio expérimentale et l'interface de monitoring des anciennes PR #1/#7 ont été réunis dans cette nouvelle PR par un commit Git à deux parents.

Les fichiers de code des deux familles sont conservés, avec leurs tests et workflows. Les documents d'instructions de la branche Health ayant divergé de ceux du bureau, leurs versions anciennes sont archivées sous `docs/merge-archive/STREAM_HEALTH-*`. **L'archive ne vaut pas validation de la télémétrie réelle.**

## Vérifier avant une fusion supplémentaire

1. Exécuter les tests du bureau de stream **et** ceux du monitor sur le dernier commit fusionné. Vérifier notamment le `package.json` et les scripts de tests.
2. Tester séparément l'authentification Twitch Helix et OBS WebSocket avec identifiants locaux hors Git. Ne jamais afficher les tokens dans la console/CI.
3. Garder la logique *fail-closed* : aucune indication verte lorsqu'il manque la preuve de réception audio et vidéo par un vrai spectateur.
4. Vérifier le navigateur, le démarrage/arrêt du serveur et les ports concurrents. Un test Node réussi ne confirme pas l'expérience en direct.
5. Si tout est stable, fusionner la PR #7 dans `main`. Sinon laisser cette unique PR ouverte pour Codex.

**Attention :** le backend du bureau de stream et la sonde Health étaient des branches de fonctionnalités différentes. Il faut encore un test fonctionnel de bout en bout pour démontrer une expérience unifiée.
