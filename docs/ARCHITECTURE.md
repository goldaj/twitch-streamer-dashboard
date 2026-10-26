# Architecture du Stream Health

```text
          Twitch Helix / EventSub                  OBS WebSocket v5
             ONLINE / OFFLINE               émission / reconnexion / compteurs
                       \                          /
                        \                        /
                         -> Collecteur de signaux <- (viewer probe à construire)
                                     |
                           décisions + hystérésis
                                     |
               serveur HTTP uniquement local 127.0.0.1:8767
                    /api/status      /api/intent
                                     |
                             widget / fenêtre Windows future
```

## Fichiers réellement implémentés
- `src/health.mjs` : fonctions décision/hystérésis, sans requête externe.
- `src/twitch-helix.mjs` : Helix app token, polling sans scopes privés, rafraîchissement.
- `src/obs-websocket.mjs` : handshake RPC v5 avec challenge, GetStreamStatus read-only, ratios sur delta de compteurs.
- `src/collector.mjs` : orchestration TTL / événements de disponibilité / volonté de live.
- `monitor/server.mjs` : HTTP local et contrôles d'intention; **pas** de base de données ou de serveur cloud.
- `monitor/index.html`, `monitor/app.mjs` : mini UI de surveillance réelle, **pas** encore overlay Windows toujours visible.
- `web/` : version de simulation du voyant seul pour tester les couleurs.
- `tests/` : mocks d'API + protocole et transactions HTTP locales.

## Règle fondamentale
On ne rend jamais `viewer` non-null tant qu'une vraie sonde n'est pas intégrée et validée. Twitch ONLINE + OBS émetteur OK = **preuve partielle seulement** et affiche gris en l'absence de défaut confirmé. Ne pas déployer un simple watcher Twitch en l'appelant « réception image et son ».

## Limites d'instrumentation
- Helix ne prouve pas ce que reçoit un spectateur et a jusqu'à ~10s de délai entre polls, **plus** propagation Twitch et confirmation. EventSub devrait améliorer la réactivité.
- OBS n'a pas accès au retour réseau du player Twitch; volume input OBS ne prouve pas volume reçu.
- Le premier relevé compteur OBS n'offre **aucun delta récent**; le second valide progression et pertes, et tout compteur bloqué/invalidé déclenche orange/gris.
- Pour une première version desktop distribuable, les identifiants ne doivent pas être codés dans l'app; architecture OAuth appropriée à choisir après POC.
