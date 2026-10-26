# Vision long terme — suite modulaire d'outils pour streamers Twitch

**Date du recueil : 2026-10-26.** Demande du propriétaire. **Statut : backlog de fonctionnalités futures, non implémentées par ce document.**
**Source de vérité du travail actuel :** [CODEX_ACTIVE_WORK.md](CODEX_ACTIVE_WORK.md), [TASKS.md](TASKS.md) et PR en cours.

## 0. Décision fondamentale de priorisation
- **P0 actuel : Stream Health Indicator** : voyant discret vert/orange/rouge/gris, état de diffusion OBS/Twitch + preuve côté spectateur image **et** son. Voir [PRODUCT.md](PRODUCT.md) et PR existantes. **Ne pas élargir ce MVP ni détourner Codex des tests réels** pour implémenter les idées ci-dessous.
- **P1 futur : Launcher / cockpit** : une entrée unique pour démarrer, visualiser et arrêter les modules configurés. D'abord fondation de l'expérience « suite d'outils ».
- **P2 futur : Compteurs, subathon, affichage Discord, overlay privé** : briques indépendantes, à trier après un retour d'usage réel.
- **P3 / R&D : Cohérence audio casque/stream et automatisations de récompenses** : forte complexité liée au routage audio, aux droits, à la sécurité et à la modération.

**P1–P3 sont des regroupements de recherche, pas des engagements calendaires.** Chaque module doit disposer d'un cahier d'acceptation et de sa propre PR avant implémentation. Voir matrice détaillée.

| ID | Besoin utilisateur | Entrées/sorties | Dépendance critique | Prototype de preuve | Priorité proposée |
| --- | --- | --- | --- | --- | --- |
| SH | Pastille indiquant si le stream fonctionne | OBS + Twitch + sonde viewer → états 4 couleurs | Preuve de lecture réelle image et audio | Voyant + scénarios de pannes réelles | **P0 actif** |
| LC | Dashboard qui lance tous les outils d'un coup | Profils de session → applications/modules | Processus Windows, permissions, reprise | Un bouton démarrer/arrêter 2 modules | P1 |
| AU | Même volume perçu selon sources, cohérence casque/stream | Capture source + routage OBS → mesures/gains | Mesures audio et monitoring réels | Banc multicanal avec sources synthétiques | R&D forte |
| CT | Compteur chronométrique personnalisable | Réglages + chrono → affichages | Horloge fiable | Timer configurable local | P2 |
| SA | Compteur subathon évoluant avec les abonnements | EventSub + règles → temps restant | Sémantique abonnements/gifts, événements manqués | Simulateur d'événements puis canal autorisé | P2 |
| OV | Overlay streamer non visible par le public | Widgets privés → surface locale | Capture Windows, OBS display capture | Test exclusion capture sur 2 modes OBS | P2 / R&D |
| DI | Module d'affichage Discord simplifié | Paramètres d'activité Discord → widget | OAuth / droits / traitement messages | Démo avec serveur et messages autorisés | P2 |
| CP | Actions liées aux récompenses de points de chaîne | Twitch EventSub → règles et modération | Scopes, abus, interdictions, quotas | Simulateur + garde-fous et audit | P3 |

## 1. SH — Stream Health : fonctionnalité fondatrice déjà engagée

**Demande :** « une pastille indiquant que tout fonctionne ou non ». Contrat actuel conservé :
- Vert si diffusion Twitch active ET état d'émission sain ET preuve récente de **réception** image/son côté viewer, dans les limites de la sonde.
- Orange : incident confirmé sans coupure complète ; rouge : coupure involontaire confirmée ; gris : observation indisponible, contradictoire, avant live ou stop volontaire.
- Protéger contre faux verts/faux rouges, afficher source et date de la preuve ; ne pas confondre audio OBS et audio entendu.
- **Le premier code et les tests de simulation existent sur des PR ; la validation sur un vrai stream n'est pas acquise.** Ne pas annoncer ce module comme livré.

**C'est le seul MVP actif.** Le launcher et les autres widgets ne sont pas des prérequis pour valider SH.

## 2. LC — Launcher de tous les outils

**Objectif :** démarrer un « setup de stream » depuis une interface centrale plutôt que lancer 8 applications.

**Parcours :** profil personnalisé → `Démarrer la session` → vérification préalable (OBS connecté, Twitch authentifié, widgets configurés) → lancement des services choisis dans un ordre de dépendance → état individuel et problèmes explicites. Bouton arrêt propre et récupération d'un module tombé.

**MVP :** lancer seulement des modules internes fictifs et au moins un outil local explicitement autorisé ; afficher running / error / stopped, journaux et redémarrage manuel. Profil sérialisé localement, chemins exécutables validés, timeout démarrage, pas de shell arbitrary/élévation de privilèges.

**À décider :** faut-il démarrer OBS/Discord eux-mêmes, ou seulement s'y connecter s'ils tournent déjà ? Application desktop Windows (probable), tray icon, démarrage auto optionnel. Pas d'exécution de programmes inconnus fournis par le chat.

## 3. AU — Cohérence et normalisation audio multi-sources, casque = stream

**Demande exacte à préserver :** « une analyse du son pour toujours avoir le même ratio sur les différentes sources + même output sur le casque et sur le stream ».

**Interprétation technique (à valider) :** le streamer souhaite simultanément (A) une **balance constante entre plusieurs sources** (micro, jeu, Discord, musique, alertes), (B) un niveau de sortie régulier côté spectateurs et (C) un **retour casque qui reflète le mix stream**, plutôt que des volumes divergents.

**Important :** normaliser chaque source de façon isolée ne suffit pas à préserver le ratio voulu. Distinguer :
- balance musicale/voix configurée, ducking optionnel et dynamique par source ;
- cible de loudness des voix et du mix (LUFS / dBFS / true-peak), compresseur/limiteur et latence ;
- mesure du **mix OBS destiné à Twitch**, plus monitor casque (périphériques virtuels / sources audio et sorties distinctes). Vérifier casque ≈ stream par mesures synchronisées, **pas par l'affirmation d'une équivalence parfaite** ;
- mix auxiliaire possible pour streamer (volume Discord différent) : la « même sortie » devient alors un **mode explicite**, pas une obligation universelle ;
- éviter réinjection du son / écho, clipping, drift, droits sur musique, latence de monitoring et déconnexions audio.

**Étude :** analyser OBS Audio Monitoring, OBS WebSocket, filtres natifs, plugins existants, routage audio système Windows et périphériques virtuels avant d'implémenter du DSP. Test pilote avec 3 signaux synthétiques et deux périphériques : LUFS short-term/intégrés, pics, latence, ratio voix/jeu, erreurs de sortie et stabilité des réglages.

**MVP futur :** moniteur read-only des niveaux de sources + recommandations de réglages + configuration d'un mix à tester manuellement. **N'automatiser gains et périphériques qu'après preuve et mécanismes de rollback.**

## 4. CT — Compteur personnalisable

**Cas d'usage :** chrono, compte à rebours ou compteur de durée écoulée visible selon préférences.

**MVP :** démarrer / pause / reprendre / reset, durée ou départ libre, style et police, couleurs accessibles, taille, format hh:mm:ss, raccourcis, capture OBS Browser Source **si destiné au public** et widget local **si privé** ; sauvegarde des paramètres.

**Exactitude :** horloge monotone pendant la session, reconstitution de la durée en cas de redémarrage, règles d'arrêt/pause clairement définies. Tests de bascule jour et mise en veille ; éviter d'ajouter ou de retirer une heure lors d'un changement d'heure.

## 5. SA — Compteur de subathon lié aux nouveaux subs

**Besoin :** compteur de durée de subathon qui augmente/diminue selon un barème configurable d'abonnements.

**Règles envisageables :**
- 1 nouveau sub = +X minutes, gift sub = +Y, renouvellement = +Z, tier 1/2/3 = coeffs ; les distinctions et sources sont **à valider** avant d'être considérées comme des faits officiels ou un barème.
- Événements Twitch EventSub reçus via WebSocket ou webhook autorisé ; identifiants d'événements pour **idempotence** et anti-double-compte ; récupération/rapprochement après coupure.
- Temps limite, minimum/maximum **facultatifs et configurables**, affichage transparent des règles, boutons correction manuelle et journal de décisions.
- Compte à rebours résilient offline/reconnexion ; mode simulation et replay pour QA avant usage réel.

**MVP :** compteur et événements synthétiques rejouables, puis test avec vraie chaîne consentante ; aucun calcul d'abonnement réel sans API et permissions adaptées. Éviter les incitations financières trompeuses : afficher clairement la contribution du sub.

**Questions :** subs déjà actifs, cadeaux multiples, annulations, remboursement et différences de tiers ; il faudra confirmer l'événement contractuel exact et les restrictions Twitch. Source : https://dev.twitch.tv/docs/eventsub/ .

## 6. OV — Overlay privé, jamais visible en stream

**Scénario :** streamer avec un seul écran voit un compteur, messages/modération, notes et état du live par-dessus son jeu, **sans capturer cet overlay vers Twitch**.

**Vigilance prioritaire :** selon **le mode de capture OBS** (capture d'écran/écran complet, capture fenêtre, Game Capture), les couches système peuvent être visibles ou non. **Ne jamais garantir la confidentialité** avant test sur la configuration réelle. Une fenêtre always-on-top « transparente » ne suffit pas à la soustraire d'une capture.

**Étude Windows :** fenêtre overlay dédiée / click-through / opacité, exclusion de capture sous Windows lorsque supportée, interaction focus/hotkeys, multi-écrans, DPI et plein écran exclusif. Évaluer les limitations et API de capture. Configurer un indicateur « confidentialité testée pour cette scène/ce mode » et un **aperçu de ce que voit OBS**.

**MVP :** widget de démonstration privé, test manuel OBS Display Capture, Window Capture et Game Capture, alertes claires si l'exclusion n'est pas prouvée. Désactivation globale d'urgence et hotkey.

## 7. DI — Affichage Discord simplifié

**Besoin :** obtenir facilement l'équivalent des overlays Discord existants sans configuration fastidieuse.

**Modes distincts à explorer :** (A) noms/avatar/prise de parole des membres d'un salon vocal, (B) messages d'un canal Discord explicitement choisi, (C) informations de serveur. Ne **pas supposer** un besoin de copier des chats privés.

**MVP :** assistant de connexion à Discord avec permissions minimales, sélection d'une source autorisée, preview, habillage personnalisable, OBS Browser Source ou overlay privé. Mode démo sans token.

**Contraintes :** respect du périmètre Discord et des utilisateurs, pas de récupération sauvage des messages, pas de self-bot, filtrage des données sensibles et consentements de la communauté. Latence et reconnexion à mesurer.

## 8. CP — Récompenses de points de chaîne et actions de modération

**Besoin :** des récompenses déclenchent des actions amusantes ou de modération (exemples initiaux : « auto-TO » / timeout automatique, « auto-ban »).

**MVP recommandé :** moteur de règles déclenché par **des événements de récompenses custom autorisées** ; simulation complète ; d'abord actions **réversibles** : afficher une bannière, lancer une animation, envoyer un message autorisé, déclencher un son sûr. Historique d'exécution, dédoublonnage, rate limiting, bouton kill-switch et confirmation des opérations sensibles.

**Timeout / ban :**
- Définir clairement la cible : récompense auto-infligée volontairement par le spectateur ou cible choisie ? **Ne jamais permettre à un utilisateur d'utiliser ses points pour bannir arbitrairement un tiers.**
- Autoriser éventuellement timeout **auto-infligé**, annoncé avec durée plafonnée et règles Twitch contrôlées ; exclure modérateurs/streamer et rôles protégés.
- **Ban permanent par récompense désactivé par défaut**, même « auto-ban », en attendant validation explicite des conditions Twitch et un contrôle renforcé ; privilégier un mode simulation ou confirmation modérateur.
- OAuth à scopes minimaux, journal des actions, rollback/unban humain, résilience aux événements répétés, limites API, règles de modération Twitch, paramètres désactivables.

**Données officielles à consulter avant implémentation :**
- https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types (redemptions et sub events)
- https://dev.twitch.tv/docs/api/reference (custom rewards et moderation)
- https://dev.twitch.tv/docs/authentication/scopes/ (permissions).

## 9. Architecture transverse à discuter (ne pas figer)
```text
                  application de session / launcher
                               |
            registre local de modules, profil et permissions
               |         |          |          |
         Health SH    Widgets UI   Audio AU  Automations CP
               |         |          |          |
             OBS/Twitch/Discord API + adaptateurs système
                    |      journal / diagnostics
              affichage privé OU sortie destinée au stream
```
- **Préférer une app locale modulaire et un bus d'événements typés** avant microservices distribués.
- Chaque module expose capacités, statut, dépendances, configuration versionnée, diagnostics, démarrage/arrêt et droits nécessaires.
- Distinguer **UI privée** (hors capture stream) et **Browser Source** / scène publique. Pas de confusion entre les deux.
- OAuth Twitch et Discord isolés en stockage sécurisé local, permissions par module et rotation; aucun token dans les logs ou documents.
- Bancs simulés et tests unitaires sans compte ni stream réel ; les essais réels sont **explicites et consentis**.
- Eviter l'usine à gaz : observer si le streamer veut **une seule application** ou de petits outils installables indépendamment.

## 10. Prochaines tâches non bloquantes pour Codex
1. **Ne pas interrompre SH.** Finir la vraie preuve Twitch/OBS/viewer selon [CODEX_ACTIVE_WORK.md](CODEX_ACTIVE_WORK.md), puis tests de bout en bout.
2. Ensuite, recueillir deux ou trois flux de travail streamer réels et décider de l'ordre de lancement des modules.
3. Prototyper LC avec modules factices, valider la notion de session de stream.
4. Évaluer séparément AU (plus risqué), OV (capture privée), SA/CP (Twitch permissions), DI (Discord), CT (simple).
5. Pour chaque module, ouvrir ticket + ADR concise (problème, alternatives, décision, preuve, limites) et PR isolée ; intégrer un module dans la suite **sans régression du voyant**.

## 11. Questions de produit à faire trancher au propriétaire
- Le cockpit est-il **l'interface principale** ou simplement un lanceur de modules indépendants ?
- Le mix casque doit-il être **bit-identique** au stream, ou juste garder les mêmes ratios/niveaux perçus ? Le micro s'entend-il dans le casque ?
- Compteurs : visibles en stream, privés, ou deux versions simultanées ?
- Discord : qui parle dans un canal vocal ou messages d'un canal texte ?
- Récompenses auto-TO/auto-ban : uniquement volontaires pour la personne qui paie les points, ou autre mécanisme ?
- PC cible Windows + OBS est une hypothèse ; autres OS/encodeurs à prioriser seulement après validation.

**Provenance :** message du propriétaire du 2026-10-26 transmis dans une conversation ChatGPT ; reprise **fidèle mais structurée**, non des spécifications techniquement confirmées. Aucun des modules LC/AU/CT/SA/OV/DI/CP n'est annoncé réalisé par la présente fiche.
