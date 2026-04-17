# Furnish — Spécification MVP

> Document de référence produit. Synthétise la vision, les décisions prises, les sections de l'app, et les questions ouvertes. À faire évoluer au fil des décisions.

---

## 1. Contexte

**Deux repos existent actuellement :**
- `vlebarbier/furnish` (V1 Victor) — Next.js + Supabase, **features métier profondes** mais structure brouillon
- `Furnishapp/Furnish` (V2 associé) — Vite + React + shadcn/ui, **UI plus propre**, features plus légères

**Décision prise :** partir de `Furnishapp/Furnish` comme base, pour l'UI propre et l'architecture claire. Customiser shadcn/ui au fil du build pour refléter l'identité Furnish.

**À récupérer de la V1 :** voir section 7.

---

## 2. Vision produit

**Furnish est une application de gestion de projet immobilier de A à Z**, du point de vue des travaux, de l'ameublement et de la décoration.

Elle accompagne l'utilisateur sur tout le cycle du projet :
1. **Brief initial** (client ou auto-brief si particulier)
2. **Suivi du chantier** (travaux, artisans, planning)
3. **Sourcing** (meubles, literie, matériaux, déco) — *cœur du produit*
4. **Présentation client** (pour les pros uniquement)
5. **Retours & validation** (feedback, itérations)
6. **Communication artisans**
7. **Livraison et clôture**

**Cœur différenciant :** le scraping automatique des produits (URL → fiche produit complète). C'est le gain de temps principal.

---

## 3. Business model

| Profil | Modèle | Prix | Accès |
|--------|--------|------|-------|
| **Maître d'œuvre / Décorateur** | Abonnement mensuel récurrent | **49 €/user/mois** | Toutes les fonctionnalités. Essai gratuit **7 jours** (carte requise ou non — à décider). |
| **Particulier (Premium)** | Paiement unique par projet | **49 €/projet** | Débloque un projet complet avec collaboration (invitation conjoint gratuite). |
| **Particulier (Free)** | Gratuit | 0 € | Version limitée — voir détails ci-dessous. |

### Version gratuite particulier — limites retenues

| Feature | Free | Premium |
|---------|------|---------|
| Projets actifs | 1 | Illimité (1 projet payé) |
| Produits par projet | **25** | Illimité |
| Pièces par projet | 2 | Illimité |
| Invitation collaborateur | ✅ (view-only) | ✅ (view + édition) |
| Export PDF | ✅ avec watermark | ✅ sans watermark |
| Scraping | Illimité | Illimité |
| Module présentation | ❌ | ❌ (réservé aux pros) |
| Module commentaires / validation | ❌ | ✅ |

**Logique :** le free est une démo fonctionnelle où le user comprend la valeur. La conversion se fait sur "je veux plus de 25 produits" et "je veux inviter mon conjoint en édition".

### Revenus complémentaires — Affiliation
Oui, monétisation par affiliation sur les URL scrapées.

**Stratégie recommandée :**
- **Phase 1 (MVP) :** aucune intégration, on collecte la donnée (URL, retailer, prix) pour préparer.
- **Phase 2 (post-lancement) :** intégrer **Skimlinks** ou **Sovrn Commerce** — scripts qui transforment automatiquement n'importe quel lien retailer en lien affilié. Zéro config, commission ~25-75 %.
- **Phase 3 (scale) :** programmes en direct avec les gros retailers (Amazon Partenaires, Maisons du Monde, La Redoute) pour des taux meilleurs.

**Conséquence design :** prévoir de stocker le retailer + URL original dans la table `products` pour analytics et affiliation future.

**Conséquence UX :** le choix du profil se fait à l'inscription et conditionne l'UI (menus, features visibles).

---

## 4. Les deux personas

### 🏠 Particulier
- Meuble/rénove son appart ou sa maison
- Un seul projet actif à la fois (rarement plus)
- Veut une UI simple, sans jargon pro
- **N'a PAS besoin de :** module présentation client, CRM, facturation
- **A besoin de :** brief perso (ses goûts, son budget), sourcing produits, planning travaux simple, suivi commandes, partage avec conjoint·e

### 🛠️ Maître d'œuvre / Décorateur d'intérieur (Bordeluche = ce persona)
- Gère plusieurs projets en parallèle pour plusieurs clients
- **Un projet = 1 pro principal (ou équipe d'une agence) + 1 à N clients invités**
- Un client peut avoir plusieurs projets avec le même pro (ou avec différents pros)
- A besoin de présenter un livrable pro au client
- Collabore avec artisans
- **Features exclusives :**
  - Module présentation client (slides, validation, feedback)
  - CRM clients (lifecycle prospect → actif → livré → archivé)
  - Invitation de collaborateurs (coéquipiers d'agence)
  - Invitation de clients sur le projet
  - Facturation / devis client
  - Branding (logo studio, couleur primaire, signature PDF)
  - Multi-projets avec dashboard portefeuille

### Collaboration (MVP)
- **Particulier Premium** peut inviter son conjoint·e (gratuit, pas de surcoût)
- **Pro** peut inviter :
  - d'autres membres de son équipe/agence (chacun nécessite un abo)
  - un ou plusieurs clients sur un projet (gratuit pour les clients, ils n'ont pas besoin d'abo)
- Un client peut être invité sur le même projet par sa femme ou par d'autres pros sur d'autres projets — une personne peut cumuler les rôles selon le contexte du projet.

---

## 5. Sections d'un projet

Un projet Furnish est structuré autour de **7 modules**, accessibles via des onglets dans la vue projet :

### 5.1. Brief
- Client / Propriétaire (nom, contact, adresse)
- Infos projet (typologie, surface, date livraison, budget cible)
- Objectifs & contraintes
- Style recherché (moodboard inspiration global, palette)
- Documents (plans, photos état des lieux)

### 5.2. Pièces (Rooms)
- Liste des pièces (salon, cuisine, chambres, SDB…)
- Plan 2D du logement avec polygones des pièces (facultatif)
- Photos avant par pièce
- Dimensions / surface par pièce

### 5.3. Chantier (Travaux) — **Golden source du suivi**

Le module Chantier est la "tour de contrôle" du projet. Il doit permettre 4 vues d'une même base de tâches :

| Vue | Usage |
|-----|-------|
| **Kanban** | Pilotage opérationnel : à faire · en cours · bloqué · terminé |
| **Liste** | Édition en masse, filtres (par pièce, artisan, priorité) |
| **Calendrier** | Planning des jalons et livraisons |
| **Timeline / Gantt** | Visualisation des dépendances et du chemin critique |

**Features :**
- Tâches hiérarchiques (tâche parent + sous-tâches)
- Dépendances entre tâches (X bloque Y)
- Contacts artisans/prestataires associés à chaque tâche
- Priorités (faible / normale / haute / urgente)
- Rappels et échéances
- Statut d'avancement + historique (versioning)
- Pièce ciblée
- **Notes rattachables à une tâche** (ex: "demander au peintre de repasser après l'électricien")
- **Photos avant/après** par tâche
- **Pense-bête global du projet** — colonne "Idées en vrac" type Inbox, où tout passe avant d'être routé vers une tâche structurée ou une spec produit
  - Ex : "ajouter une prise électrique dans la chambre" → devient une tâche assignée à l'électricien
  - Ex : "penser à mesurer la hauteur sous poutre avant de commander l'armoire" → devient une tâche dans le sourcing
- Templates de chantier (ex: "Rénovation SDB complète" = pack de 12 tâches pré-remplies)

### 5.4. Sourcing (Ameublement & Déco) — **MODULE CENTRAL**

#### Import produit
- **Scraping par URL** (feature phare)
- **Formulaire manuel** pour produits non scrapables (brocante, sur-mesure, artisan) — champs : photo, nom, quantité, prix, livraison estimée, fournisseur optionnel, URL optionnelle, notes

#### Structure produit
- Un produit = une ligne, avec l'option choisie déjà fixée dans l'URL scrapée
- Pas de taxonomie rigide (pas de catégories imposées)
- Tags libres optionnels pour filtrage
- Statuts : `idée` → `sélectionné` → `commandé` → `livré`
- Quantité par pièce (si même produit dans même pièce = augmenter la quantité)

#### Produit ↔ Pièces (relation many-to-many)
- Un produit peut vivre dans **plusieurs pièces du même projet**
- Drag-drop du produit d'une pièce vers une autre
- Bouton "changer la pièce" ou "ajouter à une autre pièce"
- Si même pièce = modifier la quantité plutôt que dupliquer

#### Moodboards — 2 niveaux
- **Moodboard global du projet** : vibe/style/palette générale, images inspiration, mots-clés. Nourrit la cohérence d'ensemble.
- **Moodboard par pièce** : canvas où on place les produits sélectionnés + quelques inspirations. C'est le moodboard "opérationnel" avec les produits réels.
- Les deux sont liés : la direction du global se retrouve dans la cohérence des par-pièce.

#### Devises
- Produits scrapés : devise source conservée (ex : prix en £ conservé tel quel)
- Affichage : prix source + prix converti en € en dessous/à côté en plus petit
- Totaux : convertis automatiquement en € pour le budget projet

#### Filtrage / recherche
- Par pièce · par statut · par tags · par fourchette de prix · par fournisseur · par date d'ajout

### 5.5. Présentation & Validation client (Pros uniquement)

#### Présentation
- Slides générées automatiquement depuis le projet (cover, résumé brief, pièce par pièce avec moodboard + produits, budget, planning, merci)
- Moodboard par pièce visible par le client (sans fournisseurs/liens)
- Plan 2D/3D avec produits placés (via Floorplanner)
- Lien partageable public (token) + PDF exportable
- Brand theming (logo, couleur primaire, police du pro)

#### Système de validation — 3 niveaux de granularité

**1. Validation produit par produit**
- Chaque produit a un état : `proposé` → `en discussion` → `validé` / `refusé` / `modif demandée`
- Zone de commentaires par produit (fil de discussion client/pro)
- Le client peut suggérer un produit alternatif (URL ou photo)

**2. Validation par pièce (lot cohérent)**
- Le pro propose un moodboard complet de pièce → le client valide en bloc ("Je valide tout le salon")
- Ou rejette en bloc avec commentaire général
- Utile pour des itérations rapides

**3. Validation par jalon / milestone**
- Le pro crée des "milestones de validation" personnalisés (ex : "Validation du brief", "Validation moodboard général", "Validation livraison")
- Chaque milestone a un statut et un historique
- Utile pour suivre l'avancement contractuel

#### Vue espace client (détaillée en section 5b)
Le client accède à un portail dédié avec : "À valider" (inbox) · Mon brief · Avancement · Univers déco · Sélection produits (sans fournisseurs) · Présentation · Budget macro · Documents · Messages.

### 5.6. Communication
- Fil de discussion par projet
- Commentaires sur produits (client, pro)
- Échanges artisans (hors scope V1 peut-être)
- Notifications

### 5.7. Finance
- Budget global prévu vs réel
- Breakdown par poste (travaux, ameublement, déco)
- Alertes dépassement
- Facturation client (pros uniquement)
- Export compta

---

## 5c. Bibliothèque du pro (réutilisation entre projets)

Un pro construit son patrimoine au fil de ses projets. Il doit pouvoir **réutiliser** ces actifs sur de nouveaux projets :

| Élément réutilisable | Source | Usage |
|----------------------|--------|-------|
| **Briefs type** | Créés depuis un projet existant ou depuis zéro (settings → Briefs) | Template appliqué à la création d'un nouveau projet |
| **Templates de chantier** | Éditables dans settings + pré-livrés (voir réponse 9) | Pack de tâches pré-remplies + dépendances |
| **Produits favoris** | Chaque produit peut être marqué ⭐ | Bibliothèque perso : on pioche depuis un nouveau projet |
| **Artisans / prestataires** | Annuaire personnel (téléphones, spécialités, notes) | Assignables sur des tâches chantier de tout projet |
| **Clients (CRM)** | Un client = un enregistrement réutilisé | Nouveau projet = reconnecter à un client existant |
| **Moodboards / palettes** | Sauvegardables depuis un projet | Réapplicables à un nouveau projet |
| **Styles signature** | Combinaison palette + typo + références du pro | Template visuel de sa "patte" |
| **Présentation template** | Layout/ordre/section customisés par le pro | Structure de slides par défaut |
| **Documents type** | CGV, contrats, devis, checklists | Attachables à n'importe quel projet |
| **Inspirations perso** | Pinterest OAuth, uploads perso, articles sauvés | Réutilisables sur tout projet |

**Implémentation :** tous ces éléments vivent en tables dédiées scoppées par `user_id` (et non `project_id`). Un champ de "rattachement" fait le lien quand l'élément est utilisé dans un projet spécifique.

---

## 5b. Matrice d'accès par rôle

Légende : ✅ accès complet · 👁️ lecture seule · 💬 lecture + commentaires · ⚠️ limité · ❌ pas d'accès

| Module | Pro (owner/collab) | Client invité par un pro | Particulier Premium | Particulier Free | Conjoint invité |
|--------|:-:|:-:|:-:|:-:|:-:|
| Brief | ✅ | 👁️ | ✅ | ✅ | ✅ |
| Pièces | ✅ | 👁️ | ✅ | ⚠️ (2 max) | ✅ |
| Chantier | ✅ | 👁️ (sans budget) | ✅ | ✅ | ✅ |
| Sourcing (moodboard + catalogue) | ✅ | 💬 (voir + commenter, pas éditer) | ✅ | ⚠️ (25 produits) | 👁️ ou ✅ (choix du payeur) |
| Présentation | ✅ | 👁️ + valider/demander modif | ❌ | ❌ | ❌ |
| Communication | ✅ | 💬 | ✅ | ✅ | ✅ |
| Finance | ✅ | ⚠️ (budget masquable par le pro) | ✅ | ⚠️ (basique) | 👁️ |
| CRM clients | ✅ | ❌ | ❌ | ❌ | ❌ |
| Branding studio | ✅ | ❌ | ❌ | ❌ | ❌ |

**Point important : le client invité d'un pro a sa propre vue**, différente à la fois du pro et du particulier. Il accède au projet via un **"Espace client"** dédié avec les vues suivantes :

| Section espace client | Contenu |
|-----------------------|---------|
| **À valider** | Les éléments en attente de sa validation (moodboard d'une pièce, choix produits, devis) |
| **Mon brief** | Le brief complet qu'il a rempli ou que le pro a rempli pour lui — éditable s'il veut compléter |
| **Avancement** | Timeline projet : jalons clés, progression chantier (sans le détail des tâches internes) |
| **Univers déco** | Moodboard + inspirations + style général — sans les liens fournisseurs |
| **Sélection produits** | Liste des produits retenus par pièce avec visuel + prix, **mais sans le nom du fournisseur ni le lien d'achat** |
| **Présentation** | Slides interactives + bouton valider/commenter |
| **Budget** | Vue macro du budget par poste (travaux / ameublement / déco), avec avancement réel vs prévu |
| **Documents** | Les documents partagés par le pro (devis, factures, plans, comptes-rendus) |
| **Messages** | Fil de discussion avec le pro et son équipe |

**Logique du masquage fournisseur :** le pro veut préserver sa valeur ajoutée (son sourcing, ses carnets d'adresses). Le client voit "Canapé 3 places - Tissu bouclé écru - 1 890 €" mais pas "Maisons du Monde, réf. 12345, lien direct". C'est ce qui justifie l'intermédiation.

**Rôles dans `project_members` :**
- `owner` — créateur du projet (pro principal ou particulier)
- `collaborator` — même droits que l'owner (coéquipier agence, ou conjoint d'un particulier premium)
- `client_viewer` — accès espace client (lecture + commentaires)
- `client_editor` — variante où le pro laisse le client éditer certaines sections
- `viewer_free` — conjoint invité sur un projet particulier free (lecture seule)

### Artisan — dans la boucle ?

**Décision MVP : non, l'artisan n'est pas utilisateur.** Il existe uniquement comme :
- Entrée dans l'annuaire Contacts (nom, métier, téléphone, email, notes)
- Assignataire sur une tâche chantier (FK optionnelle vers un contact)
- Destinataire d'emails générés depuis une tâche (ex: bouton "Envoyer le détail par email")

**Pourquoi pas de login pour l'artisan au MVP :**
- Ajoute énormément de complexité (portail dédié, notifs, validation facture, photos mission)
- Les artisans ne téléchargeront pas une app de plus — preuve : toutes les tentatives sectorielles (BoondManager, Kippy, etc.) peinent
- L'email reste le canal roi dans le bâtiment

**En V2+** : un rôle `prestataire` avec un portail minimal (voir ses missions du jour, uploader des photos, marquer terminé). À imaginer plus tard.

---

## 6. Sections de l'application (navigation globale)

| Section | Qui y accède | Rôle |
|---------|--------------|------|
| **Dashboard** | Tous | Vue synthèse multi-projets + KPI + notifications |
| **Projets** | Tous | Liste projets + création nouveau projet |
| **Projet [id]** | Tous | Vue détaillée avec les 7 onglets ci-dessus |
| **Clients** | Pros uniquement | CRM lifecycle prospect → archivé |
| **Artisans / Contacts** | Tous | Annuaire réutilisable entre projets |
| **Inspirations** | Tous | Bibliothèque personnelle de moodboards / palettes |
| **Profil & Abonnement** | Tous | Compte, branding studio, facturation |
| **Admin** | Admin seulement | Analytics plateforme |

---

## 7. Features à récupérer de la V1 (`vlebarbier/furnish`)

Classés par priorité pour le MVP :

### 🔥 Critique (à porter absolument)
1. **Scraper multi-fallback** (`src/lib/scrapers/generic.ts`) — JSON-LD → Open Graph → 14 sélecteurs CSS, multi-devises (€/$/£), multi-formats (FR `1.299,00` vs EN `1,299.00`). **Pas à rebâtir.**
2. **Pinterest OAuth + import boards** — infrastructure complète pour importer des moodboards depuis Pinterest.

### ⭐ Important (MVP v1)
3. **Système de présentation** — 8 types de slides + export PDF + brand theming (pour le persona pro).
4. **Chantier** — modèle de tâches hiérarchiques avec dépendances, versioning, calendrier.
5. **Design system "Atelier Noir"** — documentation brand (DESIGN.md). Base à adapter pour Furnish.

### 💡 Nice to have (post-MVP)
6. **CRM clients** (lifecycle complet)
7. **Finance dashboard** (budget health, alertes)
8. **Duplication de projet**

---

## 7b. Plan 2D/3D — Options & Recommandation

**Objectif cible :** permettre de disposer les produits sourcés sur un plan 3D issu du plan donné par le client.

**Construire ça nous-mêmes = plusieurs mois de R&D** (modélisation 3D, moteur de placement, bibliothèque d'objets 3D, gestion des collisions, éclairage…). Donc il faut s'appuyer sur un tiers.

### Options évaluées

| Solution | Type | Pour | Contre |
|----------|------|------|--------|
| **Upload image/PDF** | Zéro dev | Trivial, utile dès V0 | Pas d'interactivité, les produits ne se placent pas |
| **Canvas 2D custom** (Konva/Fabric) | Dev maison | Contrôle total, pas de coût tiers | 2 à 4 semaines de dev, pas de 3D |
| **Floorplanner** (API/SDK) | Partenariat | Mature, 2D+3D, export, bibliothèque objets, embed dans une app web | Commercial (négociation pricing), UI externe à styliser |
| **Planner 5D** (SDK) | Partenariat | 2D+3D, bibliothèque riche | Moins flexible en white-label, plus orienté B2C |
| **HomeByMe** (Dassault) | Partenariat | Très pro, bibliothèques catalogue retailers | Lourd commercialement, plus cher |
| **Three.js custom** | Dev maison | Full control, gratuit | 3+ mois minimum, UX complexe à construire |
| **Scan AR/LIDAR** (Polycam, Matterport) | Mobile natif | Capture réelle du logement | Mobile-first, sort du scope web |

### Ma recommandation (itérations)

**V0 (tout de suite) :** upload de l'image/PDF du plan comme fichier de projet. Aucune interactivité. Les pièces sont gérées par leurs métadonnées (nom, m², photos).

**V1 (dans le MVP vendable) :** intégrer **Floorplanner** via leur SDK d'embed. C'est LE leader B2B du secteur, ils ont :
- SDK web embed (iframe + API JS)
- Import de plan à partir d'une image
- 2D ET 3D dans le même outil
- Bibliothèque d'objets 3D (meubles génériques)
- Possibilité d'ajouter nos propres objets 3D
- Modèle commercial B2B (license par site / par user)

C'est un partenariat à négocier : estimation 30€-100€/mois par pro, à répercuter sur le prix de l'abo.

**V2 (post-MVP) :** explorer l'import automatique des produits sourcés dans l'environnement 3D Floorplanner (mapping modèle 3D générique vers le vrai meuble).

**À ne pas faire au MVP :** construire un moteur 3D custom ou un scanner AR. Trop coûteux pour la valeur apportée au démarrage.

### Question à trancher
- [ ] Confirmer Floorplanner comme partenaire cible ? Demander un devis ?

---

## 8. Stack technique

| Couche | Choix | Statut |
|--------|-------|--------|
| **Frontend** | React + Vite + TypeScript + shadcn/ui + Tailwind | ✅ Validé (base Furnishapp) |
| **Backend** | Supabase (Auth + PostgreSQL + Edge Functions + Storage) | ✅ Validé |
| **Package manager** | Bun | ✅ Validé |
| **Déploiement** | Vercel | ✅ Validé |
| **Tests** | Vitest + Playwright | ✅ Déjà configuré |

**Question résolue — Vite vs Next.js :** recommandation Vite. Raison : l'app est 100 % loggée (pas de SEO nécessaire sur l'app elle-même), Vite est plus simple, l'architecture est déjà en place. La **landing marketing** (SEO) peut vivre séparément (site dédié, sous-domaine ou page sur bordeluche.com).

---

## 9. Priorités MVP

### Quel persona construire en premier ?

**Recommandation : commencer par le parcours PRO (maître d'œuvre).**

Raisons :
1. **Victor est lui-même pro** (via Bordeluche) → dogfooding immédiat, feedback quotidien
2. **C'est le parcours le plus complet** — particulier et client sont des sous-ensembles (avec features retirées), donc construire le pro = construire le socle pour les trois
3. **C'est l'ARR récurrent** (49€/mois) — valorisation SaaS supérieure au one-shot
4. **Les 10 premiers clients pros valident le modèle** — ils ont plus de projets, plus de volume, plus de feedback

**Parcours de construction recommandé :**
1. **Phase A** — Pro owner tout seul (pas encore d'invitation, pas encore de clients invités)
2. **Phase B** — Ajout de la collaboration (invitation de coéquipiers agence)
3. **Phase C** — Ajout du client invité (espace client read-only + commentaires)
4. **Phase D** — Ouverture du parcours particulier (même codebase, features filtrées par `account_type`)
5. **Phase E** — Affiliation + features croissance

### Roadmap détaillée

**V0 — Proof of Concept (4-6 semaines)** · Persona cible : pro solo
- Auth + choix de persona à l'inscription
- Création projet (type pro)
- Brief (form light, voir [BRIEF-FORM.md](./BRIEF-FORM.md))
- Gestion pièces (liste + métadonnées, sans plan interactif, upload PDF/image plan)
- **Scraping produit par URL** (feature phare — port du scraper de la V1)
- Moodboard canvas par pièce (existant dans Furnishapp)
- Shopping list + statuts produits

**V1 — MVP vendable (3 mois)** · Persona cible : pro avec équipe + clients invités
- Brief complet (voir [BRIEF-FORM.md](./BRIEF-FORM.md))
- Chantier : vues Kanban + Liste + Calendrier, tâches hiérarchiques, pense-bête, notes
- Finance basique (budget vs réel, alertes)
- Présentation client (slides + export PDF + lien partageable avec commentaires/validation)
- Invitation collaborateurs pros (équipe agence)
- Invitation clients (espace client read-only + commentaires)
- Paiement Stripe : abo pro + essai 7 jours
- **Intégration Floorplanner** (plan 2D/3D)

**V2 — Parcours particulier + croissance (mois 4-6)**
- Ouverture persona particulier (free + premium)
- Paiement Stripe : one-shot particulier
- CRM clients complet (lifecycle + historique)
- Pinterest OAuth (import moodboards)
- Timeline/Gantt chantier
- Facturation client (devis + factures PDF)

**V3 — Scale (mois 6+)**
- Affiliation (Skimlinks/Sovrn)
- Rôle artisan (portail dédié minimal)
- Templates de projet (rénovation SDB, cuisine, appart complet)
- Mobile app (ou PWA optimisé mobile)
- API publique

---

## 10. Modèle de données — Relations users / projets / clients

### Principe
On utilise **une seule base de données** pour les particuliers et les pros (voir recommandation section 11). Le type de compte est un simple flag sur la table `users`.

### Tables clés (proposition)

```
users
  id, email, name, account_type ENUM('particulier_free', 'particulier_premium', 'pro_trial', 'pro_active')
  created_at, stripe_customer_id

user_profiles           (1-1 avec users, pour les pros surtout)
  user_id, studio_name, logo_url, primary_color, tagline

pro_clients             (CRM — entries créées par un pro)
  id, pro_user_id, first_name, last_name, email, phone, address
  linked_user_id  -- nullable, FK vers users si ce client a aussi un compte
  status ENUM('prospect', 'active', 'completed', 'archived')

projects
  id, name, type ENUM('particulier', 'pro'), created_by (user_id)
  status, created_at

project_members         (qui a accès, avec quel rôle)
  project_id, user_id, role ENUM('owner', 'collaborator', 'client_viewer', 'client_editor')
  added_by, added_at

project_billing         (pour les one-shots particuliers)
  project_id, paid_by (user_id), amount, stripe_session_id, paid_at
```

### Exemples de parcours

**Particulier Premium + conjoint :**
1. Marie s'inscrit (`account_type: particulier_free`)
2. Crée projet "Rénovation appart" → `project_members(owner)`
3. Paie 49€ → `project_billing` + passage du projet en `premium`
4. Invite Paul → `project_members(role: collaborator)` — Paul n'a rien à payer

**Pro + agence + clients :**
1. Victor (pro) crée projet pour le client "Dupont"
2. Crée une entrée dans `pro_clients` pour M. Dupont
3. Invite William (son associé) → `project_members(role: collaborator)` — William a son propre abo
4. Invite M. Dupont par email → magic link → création user + `project_members(role: client_viewer)` — Dupont ne paie pas
5. M. Dupont est aussi invité sur un autre projet par un autre décorateur → même user, autre `project_members`

### Upgrade particulier → pro (options techniques)

Tu disais "nouveau compte" par défaut. Voici les 3 options et mon analyse :

| Option | Description | Pour | Contre |
|--------|-------------|------|--------|
| **A. Nouveau compte obligatoire** | L'utilisateur doit recréer un compte avec une autre adresse | Isolation claire des rôles | Mauvaise UX, perte d'historique, duplique des emails |
| **B. Upgrade in-app avec migration** | Le particulier clique "Passer en pro", paie l'abo, son compte bascule. Ses projets existants restent accessibles. Il peut maintenant inviter des clients. | UX fluide, upsell naturel, rétention | Logique métier plus complexe (un même user change de contexte) |
| **C. Double compte sur le même email** | Un user peut avoir deux "workspaces" (perso + pro) avec une bascule dans l'UI | Très propre conceptuellement | Surcharge UX pour une fonctionnalité rare |

**Ma recommandation : option B.** Simple à implémenter (juste changer `account_type`), meilleure rétention, et l'argument "créer un nouveau compte" ne résiste pas au test utilisateur. Si quelqu'un est prêt à payer 49€/mois, on ne lui demande pas de se réinscrire.

---

## 11. Questions ouvertes à trancher

### Produit
- [x] **Les deux personas partagent-ils la même DB ou des tables séparées ?** → **Même DB**, flag `account_type` sur `users`. Raisons : futur upgrade, codebase unique, 95 % des features partagées, analytics unifiés.
- [x] **Un particulier peut-il upgrader vers "pro" ?** → **Oui, upgrade in-app (option B)**. Voir analyse section 10.
- [x] **Un client peut-il avoir plusieurs projets ?** → Oui. Un pro a N clients, chaque client a 1+ projets. Un projet = 1 pro principal (+ son équipe) + 1+ clients invités. Un même client peut être invité par plusieurs pros sur des projets différents.
- [x] **Collaboration dès le MVP ?** → **Oui**. Une agence peut mettre plusieurs pros sur un projet (chacun avec abo). Un particulier peut inviter son conjoint (gratuit).

### Business
- [x] **Prix abo pro :** 49 €/user/mois
- [x] **Prix one-shot particulier :** 49 €/projet (+ version gratuite limitée)
- [x] **Essai pro :** 7 jours
- [x] **Affiliation :** oui, via Skimlinks/Sovrn en phase 2 (voir section 3)
- [ ] **Qu'est-ce qu'on limite dans la version gratuite particulier ?** → ma reco : 1 projet, 50 produits, pas d'export PDF, pas d'invitation collaborateur. À valider.

### Technique
- [x] **Paiement :** Stripe
- [ ] **Landing marketing :** trop tôt, vérifier la disponibilité du domaine `furnish.com` avant
- [ ] **Domaine app :** idem, typiquement `app.furnish.com` si le principal est pris
- [ ] **RGPD / stockage photos :** à traiter avant mise en prod. Supabase Storage (EU region) pour les photos/plans + DPA à signer avec Supabase.

### Équipe / Rôles
- [x] **Product Owner :** Victor (porteur projet, 1er utilisateur)
- [x] **William :** expérience chef de produit, co-pilote produit
- [x] **Victor :** porteur projet + 1er utilisateur (Bordeluche) + bizdev/distribution
- [x] **`vlebarbier/furnish` :** archiver puis supprimer une fois la migration des features prioritaires terminée (scraper, pinterest, présentation, chantier, design system).

### Nouvelles questions générées par les réponses
- [x] **Essai pro 7 jours :** sans CB requise (friction minimale, "si les gens sont heureux ils resteront")
- [x] **Facturation agence :** chaque siège est payant individuellement. Un compte propriétaire facture peut englober l'équipe, mais chaque user = un siège facturé.
- [x] **Client invité :** voit le budget et les prix, voit la présentation + moodboard + brief, MAIS ne voit PAS les fournisseurs sélectionnés (les noms de boutiques/liens sont masqués)
- [x] **Pro en essai :** peut inviter des clients, avec avertissement clair "accès bloqué si essai non converti"
- [x] **Projet particulier à terme :** reste en **lecture seule à vie** (archive accessible)

### Anti-abus : empêcher les agences de partager un seul compte

Solutions techniques recommandées (combiner) :
- **Session unique par compte** (1 appareil actif à la fois, déconnexion auto ailleurs)
- **Audit log visible** : chaque action horodatée avec l'auteur, donc si 3 personnes utilisent le même login, ça se voit
- **Détection anomalie** : si 3 IP différentes en 1h, alerter/bloquer temporairement
- **Invitation obligatoire** : un pro ne peut pas désactiver l'invitation (pas de mode "je partage mon login")
- **Branding obligatoire par siège** : si un pro veut que l'export PDF affiche son nom/studio, il doit avoir son compte
- **Pricing honnête** : 49€/siège/mois reste raisonnable, pas de raison de tricher pour quelques euros de plus

### Réponses aux questions ciblées

1. **Pas de taxonomie produit figée.** Tags libres possibles pour filtrage, mais non-obligatoires.
2. **Produits et pièces — relation many-to-many.** Un produit peut vivre dans plusieurs pièces. Drag-drop entre pièces possible + bouton "changer de pièce". Pas de duplication : si même pièce = modifier la quantité.
3. **Un produit = une ligne**, avec l'option choisie dans l'URL scrapée.
4. **Formulaire manuel complet** pour produits non scrapables : photo, nom, quantité, prix, livraison estimée, URL optionnelle, fournisseur optionnel, notes.
5. **Moodboard : un global + un par pièce** (voir section 5.4 enrichie)
6. **Validation client produit par produit + à l'échelle d'une pièce + à l'échelle du projet** (voir section 5.5 enrichie)
7. **Brief non-obligatoire** pour démarrer. Toujours accessible, modifiable à tout moment. Les modifs alimentent les autres sections.
8. **Réutilisation transversale entre projets** — voir section 5c "Bibliothèque du pro"
9. **Templates chantier livrés au MVP** :
   - Rénovation appart T2 complet
   - Rénovation appart T3 complet
   - Rénovation salle de bain
   - Rénovation cuisine
   - Home staging Airbnb (1 pièce + parties communes)
   - Déco uniquement (appart vide à meubler)
10. **Dépendances tâches suggérées par IA + modifiables par l'user.**
11. **MVP = FR uniquement.** Interface FR, devise €, scrapers optimisés pour retailers FR (Maisons du Monde, AM.PM, La Redoute, Habitat, Castorama, Leroy Merlin, IKEA.fr, Westwing, Made.com, BUT…).
12. **Multi-devise : stocker la devise source**, afficher le prix converti en petit à côté, total projet converti automatiquement.
13. **Notifications : email + in-app (cloche) + push** dès le MVP.
14. **Fréquence notifs :** immédiate par défaut, **configurable** dans les settings user (immédiat / digest quotidien / désactivé par type).

---

## Historique des décisions

| Date | Décision |
|------|----------|
| 2026-04-17 | Base choisie : `Furnishapp/Furnish` (Vite + shadcn/ui) |
| 2026-04-17 | Deux personas : particulier (one-shot) et pro (abo mensuel) |
| 2026-04-17 | Scraping = feature centrale du MVP |
| 2026-04-17 | Stack : Vite > Next.js (app 100 % loggée) |
| 2026-04-17 | Prix : 49 €/user/mois (pro) · 49 €/projet (particulier) + version gratuite |
| 2026-04-17 | Essai pro : 7 jours |
| 2026-04-17 | Collaboration MVP : oui (équipe pro + conjoint particulier) |
| 2026-04-17 | Paiement : Stripe |
| 2026-04-17 | Product Owner : Victor · Co-pilote produit : William |
| 2026-04-17 | DB unifiée : un seul schéma avec `account_type` sur `users` |
| 2026-04-17 | Upgrade particulier → pro : in-app (option B), pas de nouveau compte |
| 2026-04-17 | Affiliation : Skimlinks/Sovrn en phase 2, pas au lancement |
| 2026-04-17 | Free particulier : 1 projet · 25 produits · 2 pièces · export PDF watermarké · invitation view-only · scraping illimité |
| 2026-04-17 | Ordre de construction : pro d'abord (phase A→B→C), puis particulier (phase D) |
| 2026-04-17 | Artisan = contact seulement au MVP, portail dédié en V2+ |
| 2026-04-17 | Client invité d'un pro = vue dédiée (ni pro ni particulier), rôles détaillés en section 5b |
| 2026-04-17 | Chantier = Kanban + Liste + Calendrier + Timeline (V2) · pense-bête global inclus |
| 2026-04-17 | Plan 2D/3D : upload image au V0, Floorplanner SDK en V1, pas de dev custom |
| 2026-04-17 | Brief détaillé dans doc dédié BRIEF-FORM.md |
| 2026-04-17 | Essai pro : sans CB requise (friction minimale) |
| 2026-04-17 | Facturation : par siège individuel, anti-abus via session unique + audit log |
| 2026-04-17 | Client invité : voit prix + budget, PAS les fournisseurs/liens |
| 2026-04-17 | Pro en essai : peut inviter clients avec avertissement blocage |
| 2026-04-17 | Projet particulier à terme : lecture seule à vie |
