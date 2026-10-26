# Instructions permanentes pour ChatGPT / Codex

## Mission
Créer un produit rapidement vendable : **voyant de santé Twitch** discret, destiné au streamer pendant son live. Ce n'est PAS un dashboard d'analytics généraliste. Les étiquettes vert/orange/rouge/gris doivent être déterminées sur des preuves observables et ne pas promettre « le viewer entend » si seul l'encodeur OBS est opérationnel.

## À lire dans l'ordre
1. README.md, docs/PRODUCT.md, docs/RESEARCH.md
2. docs/ARCHITECTURE.md, docs/TASKS.md, docs/HANDOFF.md
3. docs/CHATGPT_PROJECT_HISTORY.md

## Workflow
- Ne jamais écraser du code existant; branche develop pour coordination, branches feat/* pour travail et PR **draft**; ne pas merger sans revue.
- Chaque sous-étape doit mettre à jour TASKS, HANDOFF, historique et tests; distinguer hypothèses des mesures, mocks des API Twitch réellement consultées.
- Ne pas inclure de secrets Twitch, clés OBS, stream keys, captures d'écrans privées, vidéos d'autres utilisateurs ou tokens dans un dépôt public.
- Dans les états, garder **gris/inconnu** si observation manquante ou obsolète : jamais de vert par déduction depuis « online » uniquement.
- Enregistrer les raisons des changements d'état, gérer l'hystérésis et les silences légitimes; protéger les personnes filmées et les données audio.
- Un arrêt volontaire ne doit jamais générer une fausse alerte rouge.
- Les données de sondes spectateur nécessitent permission, conformité Twitch et une analyse des restrictions du lecteur officiel avant intégration. Aucun player caché, minuscule ou détourné.
- CI sans flux Twitch réel et sans authentification jusqu'à ajout d'un protocole d'intégration consenti.

## Historique
Convention source : https://github.com/goldaj/projects-incubator/blob/main/docs/GITHUB_CODEX_CONTEXT_POLICY.md
L'archive docs/CHATGPT_PROJECT_HISTORY.md est **partielle** et doit être enrichie sans fabriquer d'anciennes conversations.

## Périmètre reporté
Normalisation de loudness cible par streamer (LUFS plutôt que simple dB), **jamais** dans le premier jalon. Chat/analytics/gestion Twitch non prioritaires.

## Reprise obligatoire
**Avant tout changement de code, lire [docs/CODEX_ACTIVE_WORK.md](docs/CODEX_ACTIVE_WORK.md)** : ce fichier sur `develop` pointe les PR et les fichiers plus récents sur les branches en cours. Les instructions précédentes restent historiques ; il ne faut pas prendre le README de `main` pour l'état actuel.
