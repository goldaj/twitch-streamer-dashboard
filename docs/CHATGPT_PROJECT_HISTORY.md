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
