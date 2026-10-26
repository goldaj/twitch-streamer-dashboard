# Archive des échanges — Twitch Streamer Dashboard

**Couverture partielle** : les anciennes conversations complètes et leurs heures ne sont pas toutes disponibles. Les passages marqués `verbatim` viennent des messages visibles; la recherche contextuelle récupère seulement des résumés non verbatim, **pas** la transcription intégrale.

## Conversation historique retrouvée (22 janvier 2026)
**Assistant, résumé reconstitué et non verbatim** : avait évoqué un dashboard léger pour streamers/spectateurs : statut live, viewers, chat, raccourci stream, gestion titre/catégorie, publicité et analytics. Stack proposée React+TypeScript/Tailwind, Node/Express, Twitch Helix et OAuth; EventSub et IRC/WebSocket envisagés. Une idée de MVP en un week-end était mentionnée. Aucune première sous-étape définitive du **voyant santé** n'était attestée dans la synthèse disponible.

## 2026-10-26 — création dépôt / précision du besoin
**Utilisateur, verbatim du message de la conversation actuelle :**
> C'était dans une conversation où on parlait de projet vendable et réalisable en peu de temps.
> Mais je vais te résumer la première fonctionnalité dont on avait besoin ;
> Un petit voyant en tant réel qui indique si le stream est OK, dans le sens "en ligne", si l'image est bien castée pour que les viewer la voit et si le son arrive bien aux oreilles des viewer.
> On avait quelque part aussi une fonctionnalité d'ajustement automatique du volume sonore en temps réel, réglé en nombre de décibal par le streamer et adapté automatiquement pour que les viewers aient le même volume en sortie, mais ça ça ne va pas être notre premier sujet, je te le mets juste là pour que tu y penses.
>
> Revenons sur le petit voyant ; discret, visible en haut à droite par le streamer (et les viewer ? Peu importe) en plein stream, qui passe de vert à orange quand quelque chose foire, mais que le stream et toujours up et en rouge quand le stream a coupé sans prévenir. Quelque chose comme ça

**Assistant, résumé reconstitué, non verbatim** : distingue API Twitch « live », métriques OBS « envoi » et preuve réelle viewer pour vidéo/audio. Propose quatre états vert/orange/rouge/gris, le gris servant à éviter d'indiquer « OK » quand le contrôle est indisponible. Réserve la normalisation de niveau sonore à une version ultérieure, probablement en LUFS plutôt que simplement en décibels.

## Confidentialité et fidélité
Aucune conversation ancienne non accessible n'est inventée. Pas de secret, capture personnelle de stream ou export utilisateur dans le dépôt public.

## GitHub exécuté le 2026-10-26
- Commit de cadrage sur develop et PR #1 avec moteur + simulation 4 états. Actions 40365427678 et 40365363798 terminées success (simulations).
- Tickets #2 OBS, #3 Twitch, #4 vraie sonde viewer, #5 packaging, #6 normalisation du niveau audio (hors MVP).
- Incubateur : PR #3 non fusionnée. Aucun nouveau secret, photo ou donnée de stream réel stocké.


## 2026-10-26 — Demande d'élargissement à une suite de modules streamer

**Utilisateur (verbatim : extrait de son message de demande ; heure exacte non attestée)** :
> Outils de streamers twitch:
> Un dashboard permettant de lancer tous les outils d'un seul coup
> Une pastille indiquant que tout fonctionne ou non
> Une analyse du son pour toujours avoir le même ratio sur les différentes sources+ même output sur le casque et sur le stream
> Un compteur personnalisable pour avoir le temps qui défile
> Un compteur pour les subathons qui bougent avec le nombre de subs
> Un overlay pour afficher des infos par dessus l'écran, non visible par le stream, pour si on n'a qu'un écran par exemple
> Un module pour l'affichage discord, le même qui existe, mais plus facile d'usage
> Un truc qui gère de récompenses de points de chaîne comme l'autom-TO ou l'auto-ban avec des utilisations de points de chaîne

**Assistant (résumé non verbatim des décisions de documentation)** :
- La pastille correspond **au produit actif SH/P0** : ses états et limites restent inchangés. Le travail de PR #1/#7 et la validation réelle Twitch/OBS/sonde viewer conservent la priorité.
- Sept nouveaux modules sont **des besoins futurs**, pas du code ni des échéances approuvées : lanceur LC, audio AU, compteur CT, subathon SA, overlay privé OV, affichage Discord DI, récompenses CP.
- Nouveau cahier de recherche et backlog dans [STREAMER_SUITE_BACKLOG.md](STREAMER_SUITE_BACKLOG.md), avec preuves à obtenir avant implémentation, métriques et questions ouvertes ; les documents d'entrée et de passation sur `develop` le référencent.
- Le mix casque/stream exige une validation réelle du routage et du gain, l'overlay streamer-only une preuve qu'il n'est pas capturé selon le mode OBS, les récompenses de modération des permissions légitimes et garde-fous (pas de ban arbitraire de tiers). **Aucun module futur n'est annoncé implémenté.**
- La documentation n'autorise aucun merge implicite ni modification du code de PR en cours.

**Documentation technique externe consultée** : https://dev.twitch.tv/docs/eventsub/ et https://dev.twitch.tv/docs/api/reference . Les permissions, limitations et règles de Twitch doivent être revérifiées lors de l'implémentation ; aucune authentification réelle n'a été exécutée pour cette passe.
