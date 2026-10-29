# Sécurité, confidentialité et distribution

## Serveur prototype
- Écoute uniquement sur `127.0.0.1:8767` et refuse les Host non loopback, Origins étrangères et POST sans `X-Local-Control` spécifique. Le serveur ne propose que des routes allowlist.
- Aucun mot de passe ni jeton n'est servi au navigateur. Les champs des erreurs exposées sont génériques; les messages upstream contenant des secrets ne sont pas réémis.
- Twitch `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL`, `OBS_WEBSOCKET_PASSWORD` sont **uniquement** variables d'environnement du processus. `.env` est ignoré par Git.
- OBS WebSocket doit rester **en local** et protégé par mot de passe; URL du connecteur contrainte à `ws://localhost` / `127.0.0.1`.
- Connecteur OBS seulement `GetStreamStatus`, aucune commande de démarrage/arrêt ou changement du son.

## Risques / dette
- Le polling Helix demande un jeton d'application généré via client_credentials; un secret applicatif embarqué dans une application Windows **distribuable** pourrait être extrait. Ce design n'est adapté qu'au POC local. Pour version commerciale, étudier un backend confidentiel, OAuth utilisateur/device code/PKCE selon le mode distribué, stockage sûr des jetons et révocation.
- Une requête locale malveillante reste possible par un processus déjà présent sur la machine; ne pas exposer la porte sur LAN / Internet. Header + Origin sont garde-fous navigateur, **pas authentification d'un processus local hostile**.
- Aucun historique d'incident ni fichier audio/vidéo persisté. Les métriques existantes demeurent en RAM.
- L'absence de sonde spectateur signifie état inconnu par défaut; cela doit être expliqué dans la page et les supports commerciaux.
- Les tests GitHub sont **sans** réseau Twitch/OBS réel et ne démontrent ni intégration sur la machine utilisateur ni conformité définitive des conditions Twitch.

## Avant publication
Sécuriser OAuth et secrets, écrire tests d'intégration manuels et automatiques, options de consentement sonde, politique de conservation, mesures de false positives et UX installable. Faire revue licences/conditions Twitch/Chrome; pas de lecteur invisible ni trafic artificiel.
