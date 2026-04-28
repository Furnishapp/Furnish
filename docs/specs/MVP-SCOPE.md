# Furnish — MVP Scope

> Document figé. Tout changement passe par une décision tracée dans `DECISIONS.md`.

## Ce qu'on livre au MVP (= V1 vendable, fin de phase)

Le MVP cible **uniquement le persona décorateur indépendant (B2B)**. Le particulier B2C arrive en V2.

### IN — Le périmètre de la V1 vendable

#### 1. Authentification & comptes
- Sign-up / sign-in par email + password (Supabase Auth)
- 1 type de compte au MVP : `pro_trial` ou `pro_active`
- Essai 7 jours sans CB requise

#### 2. Création de projet
- Création multi-projets (pas de limite)
- Métadonnées : nom, photo de couverture, dates cibles, statut

#### 3. Brief light (7 sections)
Voir [`../features/brief-form.md`](../features/brief-form.md) :
- Projet (type, surface, dates, photo)
- Personnes (client + équipe pro)
- Objectifs (vision, usages)
- Budget (enveloppe, répartition, flexibilité)
- Style (préférences, palette, moodboard global)
- Documents (drag & drop)
- Planning (jalons clés)

Sauvegarde auto, score de complétion visible.

#### 4. Pièces (rooms)
- Création et suppression de pièces
- Plan canvas avec drag-drop (vue 2D libre, pas de plan technique)
- Photos avant + métadonnées (surface, orientation, lumière)

#### 5. Sourcing produits
- **Paste d'URL** dans le dashboard → scraping Open Graph + parse HTML basique
- Formulaire manuel pour produits non-scrapables
- Produit lié à 1+ pièces (M2M, drag-drop entre pièces)
- Statut produit : `idée` → `sélectionné` → `commandé`

#### 6. Moodboard par pièce
- Canvas drag-drop avec produits + images d'inspiration
- Couleurs sauvegardées par pièce
- Toggle caption visible/masquée (mode présentation)

#### 7. Budget
- Vue table par pièce et globale
- Calcul auto du total + alerte budget
- Édition prix inline

#### 8. Présentation client
- Génération auto de slides depuis les données projet
- Réordonnancement et masquage de slides
- 4 types de slides : Brief, Mood, Produits, Budget
- **Marque blanche** : pas de noms de fournisseurs, pas de liens d'achat
- Branding pro basique (logo + couleur primaire)

#### 9. Partage et validation client
- Lien public par token (pas de compte requis pour le client)
- Validation simple : ✅ Validé / 💬 Commentaire par slide
- Notification email au pro à chaque retour
- Export PDF de la présentation

#### 10. Collaboration équipe pro
- Invitation par email d'un coéquipier d'agence
- Tous les coéquipiers ont les mêmes droits (pas de RBAC fin)
- Chaque siège est facturé séparément

#### 11. Paiement
- Stripe abonnement mensuel 49 € HT / siège / mois
- Essai 7 jours sans CB
- Carte bancaire ajoutée à la fin de l'essai pour continuer

---

### OUT — Ce qu'on NE livre PAS au MVP (reporté V2+)

| Feature | Raison du report | Cible |
|---|---|---|
| Parcours particulier (B2C) | Focus B2B d'abord | V2 |
| Génération de devis | Doit suivre la validation, pas avant | V2 |
| Module chantier (Kanban / Gantt / artisans) | Complexité énorme, pas core | V3 |
| Extension Chrome | Coûteuse en dev, paste URL suffit | V3 |
| Plan 2D/3D Floorplanner | Partenariat à négocier | V3 |
| CRM clients complet | Trop tôt | V2 |
| Pinterest OAuth | Nice to have | V2 |
| Affiliation Skimlinks/Sovrn | Volume requis avant | V3 |
| Templates de chantier | Lié au module chantier | V3 |
| Facturation client (devis + factures PDF) | V2 | V2 |
| Multi-langue / autres pays | FR-only au MVP | V3 |
| Rôle artisan / portail prestataire | Pas leur outil | V4+ |
| Mobile app native | PWA suffit | V4+ |
| Comptabilité / export compta | Pas notre métier | Jamais |

---

### Critères de release

La V1 est livrable quand :

1. ✅ Bordeluche a réussi à porter au moins **3 projets clients réels** sur Furnish, du brief à la validation
2. ✅ Au moins **5 décorateurs externes** (hors Bordeluche) ont signé un essai et au moins 2 ont converti en payant
3. ✅ Un projet peut tourner sans intervention manuelle de Victor (pas de bug bloquant, pas de support manuel quotidien)
4. ✅ Le tunnel paiement Stripe fonctionne en production (carte test + carte réelle)
5. ✅ La présentation publique tourne sur mobile + desktop sans bug visuel

---

### Risques au scope

- **Risque schéma** : la migration `users → organizations` pour supporter la collaboration peut bouger le SLA si on attend trop. Reco : faire la migration au début de la V1, pas à la fin.
- **Risque scraping** : sites e-commerce qui changent leurs balises, ou qui bloquent le scraping côté serveur. Mitigation : Open Graph est très stable + fallback formulaire manuel.
- **Risque branding** : si le design n'est pas validé en V0, la V1 vendable peut sembler générique. Mitigation : [`BRAND.md`](./BRAND.md) à figer avant fin V0.
