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
## Avancement 2026-10-26 : connecteurs réels en PR isolée
- PR #1 `feat/health-indicator-mvp` vers develop : moteur pur, UI de simulation. PR #7 `feat/obs-twitch-telemetry` basée sur la branche de PR #1 : **connecteurs Twitch Helix et OBS WebSocket en lecture seule**, serveur local avec volonté de diffusion. Aucune fusion ou modification de Codex.
- Code `npm test` teste les mocks, **pas** les services réels. L'essai manuel OBS/Twitch sera requis avant de dire « opérationnel ».
- `src/health.mjs` doit rester **fail closed** : Twitch ONLINE + OBS OK ne permet jamais un vert sans lecture viewer positive. Un ratio de frames OBS de la vie entière du stream n'est pas preuve récente : utiliser deux échantillons et vérifier la progression.
- Intervalle actuel : OBS 3 s (TTL 12 s), Twitch Helix 45 s (TTL 90 s), viewer envisagé TTL 12 s. Valeurs **hypothèses**, à calibrer après essais.
- Si la sonde spectateur n'est pas disponible, conserver `viewer:null`, afficher état gris ou panne orange/rouge dûment confirmée; ne jamais simuler des mesures derrière l'interface réelle.
- Priorité suivante : validation vraie connexion et R&D du contrôle côté spectateur. Lire `docs/VIEWER_PROBE_PLAN.md`, `docs/SECURITY.md`, `docs/ADR_0001_SIGNALS.md`.
- La fiche Twitch a été retirée de `projects-incubator/main` par fusion de sa PR #3, SHA `2bed7a59915aebb51a64672631a5c5b19f2d8e8d`. Ne pas remettre l'idée à l'incubateur.

## Latest coordination
Lire aussi `docs/CODEX_ACTIVE_WORK.md` pour les commits, statuts et issues actifs. Ce fichier a été ajouté sur `develop` avant la passation à Codex.
