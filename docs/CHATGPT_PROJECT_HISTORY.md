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

## 2026-10-26 — Audit, lancement connecteurs et nettoyage incubateur

**Utilisateur (verbatim, message courant) :**
> vas-y, go. On se lance ! Réfléchis bien avant, documente tout, assure toi que Codex pourra reprendre le travail plus tard. Bref, fait ce que tu sais faire le mieux à force de simuler un chercheur, et part ensuite le code en tant qu'ingénieur une fois que t'es confiant ! Ah et dans le repo incubator, ce projet ne doit plus apparaître du coup, vu qu'il son propre repo maintenant.
>
> Bon j'envoie ce message un peu tard, t'as peut être déjà tout fait, mais rechallenge le et refait une passe dessus juste pour être sûr.
>
> Et ensuite tu peux aller plus loin et continuer sur la suite :)

**Assistant (résumé reconstitué, non verbatim) :** a réévalué le produit, identifié les risques de faux verts et fausses coupures, et décidé d'instrumenter réellement Twitch et OBS avant le volet expérimental viewer. A **fusionné** la PR #3 de l'incubateur pour supprimer effectivement la fiche devenue projet autonome (commit `2bed7a59915aebb51a64672631a5c5b19f2d8e8d`). Le fichier a été vérifié absent de main.
- PR #7 `feat/obs-twitch-telemetry` basée sur PR #1 pour ne pas écraser ses travaux; Twitch Helix OAuth client credentials (server only), OBS WebSocket 5 authentifié, collecteur/serveur HTTP local, widget d'état partiel et tests mocked.
- Première CI a signalé un test historique incomplet suite au durcissement des preuves. Les tests ont été corrigés pour demander une mesure valide de pertes d'images.
- Rechallenge : OBS calcule les pertes par delta de compteurs consécutifs et exige progression des frames. Premier compteur ne donne pas une mesure récente. Aucun faux succès de vert sans sonde.
- **Pas de tests sur un vrai flux Twitch/OBS** depuis ChatGPT; seuls tests Node/CI. Aucun credential personnel consulté ou commité. La sonde viewer reste un problème de recherche à résoudre.
- Détails et plan Codex dans `docs/HANDOFF.md`, `docs/TEST_PLAN.md`, `docs/VIEWER_PROBE_PLAN.md` et `docs/ADR_0001_SIGNALS.md`.

## 2026-10-26 : instrumentation exploratoire réception audio
**Assistant, résumé reconstruit (non verbatim)** : ajoute une page d'expérience `/probe/`, utilisant une capture volontaire de l'onglet choisi par l'utilisateur et un analyseur RMS/dBFS sans stockage. Cette expérience n'est **pas** une sonde de décodage vidéo Twitch certifiée : aucun signal n'est transmis au moteur vert, pour éviter une fausse garantie. Test automatisé de calcul audio uniquement, pas d'essai Chrome réel.
