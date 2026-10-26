# Twitch Stream Health Indicator

**Statut :** projet initialisé, code de la première simulation sur PR dédiée. Le produit cible est un **voyant de santé en temps réel** pour un streamer Twitch, et non un dashboard statistique complexe.

## Premier besoin
Pendant un live, garder dans un coin de l'écran du streamer un voyant :
- **Vert** : Twitch confirme la diffusion ET une sonde côté spectateur a vérifié une image décodée et un signal audio pertinent.
- **Orange** : Twitch est toujours en direct mais au moins une anomalie image/son/envoi est détectée.
- **Rouge** : le live est interrompu **alors que le streamer voulait continuer** (pas lors d'un arrêt volontaire).
- **Gris** : surveillance indisponible / preuve insuffisante / avant le live. Mieux qu'un faux vert.

Le voyant doit rester discret, montrer le détail à l'ouverture/au survol, et éviter les alertes dues à une microcoupure. Il est **destiné au streamer**, pas nécessairement visible des spectateurs. Le test initial utilise un simulateur d'incidents, pas encore une chaîne Twitch réelle.

## Documentation
- [Produit et cas de panne](docs/PRODUCT.md)
- [Pourquoi une sonde spectateur est indispensable](docs/RESEARCH.md)
- [Architecture et limites](docs/ARCHITECTURE.md)
- [Backlog et critères de réussite](docs/TASKS.md)
- [Prochaine session Codex](docs/HANDOFF.md)
- [Historique et provenance](docs/CHATGPT_PROJECT_HISTORY.md)

## Plan court
1. Moteur état vert/orange/rouge/gris + interface simulée testée.
2. OBS WebSocket pour émission locale et mesures audio.
3. Twitch Helix/EventSub pour statut réel, sans exposer de secrets.
4. Sonde côté spectateur pour image + son reçus; ne pas prétendre vert complet avant sa validation.
5. Application discrète toujours au premier plan, packaging et déploiement vendable.

**Hors MVP** : viewers, analytics détaillées, chat, publicités, normalisation automatique du volume. Celle-ci est notée pour la suite (cible en LUFS, signal et gains contrôlés).

Licence MIT. Convention AGENTS.md et historique des discussions disponibles.