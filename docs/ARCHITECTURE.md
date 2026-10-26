# Architecture projetée — MVP puis sources réelles

```text
 OBS WebSocket (état émission, pertes, audio local) ─┐
                                                    │
 Twitch Helix/EventSub (live/offline) ───────────────┤
                                                    ├─> Observation normalisée avec horodatages
 Sonde viewer (décodage vidéo + audio) ─────────────┘           │
                                                               ▼
                                                 Moteur santé / hystérésis
                                                               │
                                                               ▼
                                                 Voyant discret + explication
```

## Code initial prévu / à tester
- `src/health.mjs` : moteur pur (aucun secret ou réseau), transition état / raisons + fraîcheur des observations.
- `web/` : maquette fonctionnelle avec scénarios de tests (pas de vraie API).
- `tests/` : simulation d'incidents, silence volontaire, offline attendu et reconnexion.
- `docs/TEST_PLAN.md` : tests réels et garde-fous avant affichage vert en production.

## Contrats
Signaux : `armed`, `expectedLive`, `wasLive`, `twitch:{online,at}`, `obs:{streaming,reconnecting,dropRatio,at}`, `viewer:{videoPlaying,framesAdvancing,audioTrack,audioActive,at}`.
Ces sources évoluent indépendamment; TTL et décisions « inconnu » sont obligatoires. `audioActive` doit être issu d'une fenêtre temporelle et d'une condition « son attendu », non d'un échantillon isolé.
De préférence, l'indicateur ne sera **visible que par le streamer** (fenêtre always-on-top à développer) ; l'intégration OBS Browser Source afficherait aussi le voyant aux viewers si incluse dans la scène.

## Anti-portée
Le code 2026-10-26 ne doit pas déjà être décrit comme une intégration Twitch active. Les API externes ne sont pas implémentées tant que tests et preuve de source ne sont pas présents. Aucun secret client dans une page web publique.
