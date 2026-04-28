# Furnish — Roadmap

> *Dernière mise à jour : 27 avril 2026*
> Document vivant. Mis à jour à chaque jalon livré, ou tous les mois.
> **Aucune date n'est un engagement contractuel.** Les fenêtres sont des estimations actuelles avec les hypothèses connues à ce jour.

---

## Hypothèses qui sous-tendent cette roadmap

| Hypothèse | Si fausse, impact |
|---|---|
| Victor reste à temps partiel (~50-70 % d'un temps plein) sur Furnish | Tout glisse de 30-50 % |
| William contribue régulièrement (~1 jour/semaine) | V1 glisse de 1-2 mois |
| Pas d'autre fondateur ni dev recruté avant V1 livrée | Pas d'accélération possible |
| Le scraping fonctionne sur ≥ 80 % des retailers FR rencontrés | Sinon V0 prend 2-3 mois de plus |
| Bordeluche dispose d'au moins 2 projets clients réels à dogfooder en V0 | Sinon le DoD V0 ne peut pas être validé |
| Les premiers décorateurs alpha sont identifiables et accessibles via le réseau Bordeluche | Sinon V1 demande du sourcing à froid (lent) |

Si une hypothèse change, on relit cette roadmap **avant** de promettre quoi que ce soit.

---

## Phase V0 — Proof of Concept

**Statut** : en cours, depuis ~mars 2026.
**Fenêtre estimée pour clôturer** : 6 à 10 semaines à partir d'aujourd'hui (selon disponibilités et bugs découverts en dogfooding).

**Objectif** : Bordeluche utilise Furnish sur **au moins 2 projets clients réels**, du brief à la présentation envoyée et validée. Aucun euro facturé via Furnish. C'est de la R&D produit, pas du business.

### État réel du V0 actuel — à auditer

> ⚠️ **Cette section doit être confirmée par Victor (ou via revue de code) avant qu'on s'engage sur quoi que ce soit derrière.** J'ai listé les modules connus, mais je n'ai pas audité le code. Le statut est à mettre à jour après audit.

| Module | Présent dans le code ? | Niveau de finition | Bloquant V0 ? |
|---|---|---|---|
| Auth Supabase (signup/signin) | À confirmer | À auditer | Oui si cassé |
| Dashboard projets (liste + création) | À confirmer | À auditer | Oui |
| Brief mode (cards About + Client) | À confirmer | À auditer (incomplet vs spec actuelle) | Non, brief light suffit |
| Plan mode (canvas pièces) | À confirmer | À auditer | Non bloquant |
| Room view (canvas moodboard) | À confirmer | À auditer | Oui |
| Ajout produit par URL (edge function `preview`) | À confirmer | À auditer (couverture retailers FR ?) | **Critique** |
| Mood mode (palette + inspirations) | À confirmer | À auditer | Non |
| Budget mode (table + totaux) | À confirmer | À auditer | Oui |
| Slides mode (génération + share token) | À confirmer | À auditer | Oui |
| Présentation publique par token | À confirmer | À auditer | Oui |
| Admin dashboard (analytics) | À confirmer | À auditer | Non bloquant V0 |

**Conventions de niveau de finition** :
- `Happy path OK` : marche dans le scénario nominal
- `Happy path OK, edge cases cassés` : suffisant V0 si on dogfoode prudent
- `Buggé` : ne sort pas de V0
- `Manquant` : à coder

> Action : Victor remplit cette grille au prochain commit (ou via une PR sur ce doc), avec un audit honnête. C'est le seul moyen de planifier la suite.

### Reste à faire pour clôturer V0

- [ ] **Audit code** — remplir la grille ci-dessus, lister les bugs bloquants
- [ ] **Robustifier le scraping** — au minimum 5 retailers FR cibles fonctionnent : Maisons du Monde, La Redoute, AM.PM, IKEA, Selency. Mesure : 8 URLs sur 10 rendent un titre + image + prix corrects.
- [ ] **UX du panneau d'ajout produit** — fluide, error-handling, feedback visuel
- [ ] **Polish loading states + transitions + error boundaries** — éviter les écrans blancs
- [ ] **Brief MVP allégé** — 12 champs au lieu des cards About+Client actuelles (cf. [`../features/brief-form.md`](../features/brief-form.md))
- [ ] **Décision branding** — palette finale, logo, typographie. **Pré-requis avant attaque V1.**
- [ ] **Dogfooding réel Bordeluche** — au moins 2 projets clients vraiment portés sur l'outil
- [ ] **Migration de schéma DB** — passer du schéma V0 au schéma V1 cible (cf. [`../architecture/DATA-MODEL.md`](../architecture/DATA-MODEL.md))

### Definition of Done — V0

V0 est *clôturée* si **les trois conditions** sont remplies :

1. ✅ Audit du code à jour, bugs bloquants triés en P0/P1, P0 résolus
2. ✅ Bordeluche a porté **2 projets clients réels** complètement sur Furnish (brief → présentation envoyée et lue par le client) — sans aucun fallback Excel ou PowerPoint
3. ✅ Le schéma DB est migré sur la cible V1 (organizations, products, room_product_links, etc.) — ou on a un plan de migration concret prêt à l'exécution

**On ne passe pas à V1 sans ces trois conditions remplies.**

---

## Phase V1 — MVP commercial

**Fenêtre estimée** : 4 à 6 mois après clôture V0.
**Pourquoi cette fenêtre et pas 3 mois** : payment, onboarding pro, branding studio, invitations clients, validation, notifications, export PDF, Stripe lifecycle, gestion d'erreurs payantes, support — chaque module a 2-3 semaines de dev + test minimum.

**Objectif business** : signer **les 5 premiers décorateurs payants**. Premier euro encaissé. Découvrir si l'hypothèse H1 (49 €/mois acceptable) tient.

### Migrations techniques majeures (si pas faites en V0)

- Passage au schéma cible : `organizations`, `organization_members`, `project_participants`, `clients`, `products`, `room_product_links`, `quotes`, `subscriptions`, `user_profiles` (cf. [`../architecture/DATA-MODEL.md`](../architecture/DATA-MODEL.md))
- `account_type` sur `user_profiles` (`pro_trial`, `pro_active`)
- RLS Supabase activée sur toutes les tables

### Features V1 (par ordre de priorité)

**Critiques (bloquant la facturation)** :
- **Stripe abonnement** — 49 € HT/siège/mois, essai 7 jours sans CB, gestion CB self-service, factures PDF Stripe
- **Onboarding pro** — choix studio, ajout logo + couleur primaire
- **Pricing page publique**
- **Pages légales** (CGU, CGV, RGPD, mentions légales) — non négociable en France

**Critiques (bloquant l'usage final)** :
- **Brief complet** — 12 champs (cf. [`../features/brief-form.md`](../features/brief-form.md))
- **Branding studio appliqué** sur présentations + emails sortants
- **Invitation client par email** — magic link, accès `client_viewer` à la présentation
- **Validation client** — ✅ Validé / 💬 Commentaire par produit, traçabilité
- **Notification email** au pro à chaque retour client (Resend)
- **Export PDF** présentation (avec watermark si trial expiré)

**Importants (sans quoi le pro ne reste pas)** :
- **Compte admin abonnement** — voir factures, mettre à jour CB, désabonner
- **Edge cases Stripe** — paiement refusé, CB expirée, downgrade, refund
- **Onboarding email automatique** — séquence J0/J3/J5/J7 sur Resend

### Definition of Done — V1

V1 est *clôturée* si **toutes les conditions** sont remplies :

| Condition | Cible | Mesure |
|---|---|---|
| Tunnel paiement Stripe fonctionnel en prod | Carte test + carte réelle, signups + facturations + résiliations sans intervention manuelle | 5 essais réels sans bug |
| Stabilité technique | Pas de bug bloquant en prod sur 14 jours consécutifs | Sentry zéro alerte P0 sur 14 j |
| Acquisition initiale | 5 décorateurs externes (hors Bordeluche) ont créé un compte trial | Compteur signups dans admin |
| Conversion | Au moins **2 ont converti en payant** sur les 5 trials | Stripe MRR > 0 |
| Auto-portance | Un projet peut tourner sans intervention de Victor (zéro support manuel quotidien) | Aucun ticket support manuel sur 7 jours consécutifs |

> ⚠️ Ne sont **pas** des DoD : NPS, satisfaction qualitative, recommandations. Trop volatiles à 5 clients.

---

## Phase V1.5 — Solidification

**Fenêtre estimée** : 2 à 4 mois après V1.

**Objectif** : passer de 5 à 15-20 décorateurs payants. Stabiliser, retenir, écouter.

### Features V1.5

- **Commentaires** sur projet/pièce/produit — UI activée (table déjà créée en V1)
- **Analytics présentation fines** — heatmap des slides vues, durée, qui a regardé (cf. table `presentation_views`)
- **Résumé IA du brief** — Claude Haiku ou GPT-4o-mini, injecté dans la slide brief de la présentation
- **Templates de brief** — basiques, non personnalisables
- **Améliorations scraping** — élargir aux retailers FR de niche identifiés en feedback alpha
- **Multi-langue UI** — au moins EN en plus de FR (sans ouvrir d'autres marchés, juste pour UI propre)

### Definition of Done — V1.5

- 15 décorateurs payants
- Rétention 3 mois ≥ 70 % sur les 5 premiers
- Au moins 50 présentations envoyées et 30 validées (NSM = 30)

---

## Phase V2 — Particulier + croissance

**Fenêtre estimée** : 3 à 6 mois après V1.5.
**Pré-requis** : V1.5 tient debout sans Victor en support permanent. Sinon on n'ouvre pas le funnel B2C qui multiplie le volume.

**Objectif** : ouvrir le funnel B2C. Tester l'hypothèse H4 (49 € one-shot). Atteindre 50 décorateurs payants + 100 particuliers premium / mois.

### Features V2

**Parcours particulier** :
- Compte `personal_free` avec limites (1 projet, 25 produits, 2 pièces, export PDF watermarké)
- Premium one-shot Stripe Checkout 49 €/projet, déblocage 12 mois (cf. anti-abus dans [`PRICING.md`](./PRICING.md))
- Invitation conjoint·e gratuite sur projet premium
- Upgrade in-app particulier → pro (option B documentée)

**Devis** :
- Génération PDF du devis depuis présentation validée
- Format légal FR (numérotation continue par org, mentions obligatoires)
- Branding studio appliqué
- TVA simple (HT + TTC affichés, taux 20 % par défaut)

**Côté pro** :
- CRM clients basique (prospect / actif / archivé)
- Pinterest OAuth (import de boards en inspirations)
- Bibliothèque produits favoris (étoile)

### Definition of Done — V2

- 50 décorateurs payants
- 100 particuliers premium payants par mois sur 3 mois consécutifs
- Devis générés au format légal FR sans intervention manuelle
- Hypothèse H4 (49 € particulier accepté) validée ou invalidée par les chiffres

---

## Phase V3 — Scale et écosystème

**Fenêtre estimée** : 6 à 12 mois après V2 (donc ~18 à 28 mois après aujourd'hui).
**Note honnête** : à cette horizon on ne planifie plus, on prévoit. Cette section est **indicative**, pas engageante.

**Objectif** : verrouiller la rétention, élargir le revenu (affiliation), diversifier les usages.

### Pistes envisagées (à arbitrer en fonction des données V2)

- **Extension Chrome** Manifest V3 — Inspiration mode + Sourcing mode
- **Module Chantier light** — Kanban simple + tâches + assignation artisan (sans portail artisan)
- **Affiliation Skimlinks ou Sovrn** — commission sur achats meubles depuis présentation client. Pré-requis : volume suffisant (~10 k présentations/mois)
- **Plan 2D/3D via partenariat Floorplanner** — SDK intégré, pas de modélisation propriétaire
- **Templates de chantier** — packs préfaits (Rénovation SDB, Cuisine)
- **Facturation client complète** — devis + factures + signature électronique + relances impayés
- **Audit log** par projet (UI historique, table `activity_logs` déjà alimentée en V2)
- **Multi-organisations** pour pros (un studio + une agence)

### Cible V3

- 200 décorateurs payants
- ARR > 100 k€
- Premiers euros d'affiliation encaissés
- Décision claire sur extension géographique (UK/BE/CH ?) ou non

---

## Phase V4+ — Long terme (à 24+ mois)

À discuter quand on aura les données. Pas d'engagement.

- Mobile app native (ou PWA suffisante selon les usages observés)
- Multi-langue / international (UK, BE, CH puis Espagne)
- Portail artisan / prestataire
- API publique
- Marketplace de templates (autres pros vendent leurs briefs / chantiers types)
- Intégration HomeByMe / Kozikaza pour synchro 3D

---

## Anti-roadmap (ce qu'on ne fera jamais ou très tard)

- ❌ Comptabilité native (export OK, pas de saisie native — on s'intègre avec Pennylane/Tiime)
- ❌ Modélisation 3D propriétaire
- ❌ Vente de meubles directe (marketplace)
- ❌ Outil de chat client interne (on s'intègre avec WhatsApp/Slack/email plutôt)
- ❌ Plateforme de mise en relation décorateurs ↔ particuliers
- ❌ App mobile native iOS/Android avant V3 minimum

Cf. [`VISION.md`](./VISION.md) section anti-vision pour le détail.

---

## Risques majeurs sur la roadmap

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Scraping casse en cascade quand les sites changent leurs balises | Élevée | Moyen | Fallback formulaire manuel + Open Graph robuste + monitoring quotidien des retailers top 10 |
| Stripe pose un problème en France (TVA auto, OSS UE, refus PSE) | Faible | Élevé | Documentation rigoureuse + Stripe Tax + test sur Bordeluche (vrai client FR) |
| Aucun décorateur externe ne convertit (H1 fausse) | Moyenne | Critique | Avoir préparé un plan B : 29 €/mois, ou freemium, ou repositionnement |
| Concurrent FR émerge entre V1 et V2 | Faible (marché désert aujourd'hui) | Élevé | Aller vite sur l'acquisition pre-V2 + verrouiller via la qualité de la curation produit |
| Burn-out fondateur (Victor) — solo + autre activité Bordeluche | Moyenne | Critique | Cadence soutenable, pas de sprint week-end, déléguer support à un VA dès V1 |
| Bug critique en prod côté présentation publique = client humilié devant son client | Moyenne | Élevé | Tests E2E sur le flow présentation dès V1, monitoring Sentry, rollback Vercel <1 min |

---

## Décisions ouvertes

- [ ] Faut-il recruter un dev en V1 (3 mois après V0) ou tenir à deux jusqu'à V2 ?
- [ ] Lancement V1 : public ou bêta privée invite-only ?
- [ ] Arbitrer la part de temps de Victor entre Bordeluche (revenu actuel) et Furnish (futur) au fil des phases
- [ ] Choisir un seuil clair de « pivot » si H1 ou H2 s'effondrent en V1
