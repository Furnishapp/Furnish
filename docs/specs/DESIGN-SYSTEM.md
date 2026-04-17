# Furnish — Design System

> Document vivant. Deux parties : le **plan d'action** pour construire le design system (partie A) et le **design system lui-même** (partie B), à remplir au fur et à mesure des décisions prises.

---

# PARTIE A — Plan d'action

## Objectif
Construire un design system cohérent, maintenable et adapté à la double cible (pro / particulier), qui :
- Reflète la valeur premium du produit (les designers d'intérieur sont exigeants)
- Reste sobre et fonctionnel (le pro passe 4h/jour dessus)
- S'adapte au branding des pros (leur logo/couleur sur la présentation client)
- Tire parti de shadcn/ui et Tailwind CSS (gain de temps énorme)

## Philosophie
Pas un design "startup générique". Le produit doit ressembler à un **outil métier premium utilisé par un pro**, pas à une SaaS Airbnb-clone. Inspiration : Linear, Height, Superlist, Notion en mode focus, Figma, Are.na.

## Les 7 phases (séquentielles)

### Phase 1 — Direction Artistique (Semaine 1)
**Objectif :** Définir la "personnalité visuelle" de Furnish. Pas de pixels, juste de l'intention.

**Actions :**
- [ ] Collecter 30 refs Dribbble/Behance/produits réels, triées en 3 catégories :
  - SaaS tools sobres (dashboards, listes, canvas)
  - Univers décoration/architecture (Atelier Vime, Cosmos, Are.na, Pinterest, Houzz Pro)
  - Outils de gestion projet premium (Linear, Height, Superlist)
- [ ] Créer 3 moodboards de direction possibles :
  - A. "Éditorial sobre" — noir/blanc/gris chaud, typos serif + sans-serif, beaucoup de blanc
  - B. "Chaleureux artisanal" — terre cuite / vert olive / crème, serif à empattements
  - C. "Architecte contemporain" — gris charbon / blanc cassé / accent coloré vif, typos modernes
- [ ] Victor + William choisissent une direction (ou combinent)
- [ ] Valider 5 mots-clés qui décrivent la marque (ex: élégant, calme, pro, chaleureux, précis)

**Deliverable :** moodboard unique + 5 mots-clés dans la partie B section "Direction Artistique"

---

### Phase 2 — Identité de marque (Semaine 2)
**Objectif :** Logo + typographie + palette.

**Actions :**
- [ ] Logo : créer ou adapter un logo simple (mot-symbole type "Furnish" en typo custom, ou monogramme "F")
- [ ] Wordmark + favicon
- [ ] Typographie :
  - Police d'affichage (titres, hero) — ex : serif élégante type Canela, Tiempos, Söhne
  - Police de texte (body) — ex : sans-serif neutre type Inter, Geist, Söhne
  - Police mono pour les chiffres/prix (optionnel)
- [ ] Palette :
  - 1 couleur primaire (accent, CTAs)
  - 1 couleur secondaire (highlights)
  - Grille de gris neutres (background, borders, text)
  - Couleurs sémantiques (success vert, warning orange, error rouge, info bleu)
- [ ] Tailwind config customisée avec toutes ces valeurs

**Deliverable :** section "Brand" + "Palette" + "Typographie" remplies dans la partie B

---

### Phase 3 — Fondamentaux (Semaine 3)
**Objectif :** Poser les règles systémiques.

**Actions :**
- [ ] Échelle d'espacement (4, 8, 12, 16, 24, 32, 48, 64…) — Tailwind par défaut convient souvent
- [ ] Échelle typographique (tailles de texte, hauteurs de ligne, poids)
- [ ] Radius (0, 4, 8, 12, 16 — pour cartes, boutons, modales)
- [ ] Ombres (4 niveaux : none, subtle, elevated, floating)
- [ ] Border widths (0, 1, 2)
- [ ] Grille de layout (colonnes max, gaps, containers)
- [ ] Icônes — choisir une lib (Lucide recommandé, c'est le standard shadcn)
- [ ] Illustrations : ton et source (custom, Storyset, Humaaans, illustrations éditoriales ?)

**Deliverable :** section "Fondamentaux" dans partie B

---

### Phase 4 — Composants de base (Semaine 4-5)
**Objectif :** Customiser shadcn/ui pour refléter la DA.

**Actions :**
- [ ] Button (primary, secondary, ghost, destructive, size variants, with icon)
- [ ] Input / Textarea / Select (+ states : default, focus, error, disabled, readonly)
- [ ] Checkbox / Radio / Switch
- [ ] Card (3 variants : default, elevated, interactive)
- [ ] Badge (status, count, tag)
- [ ] Avatar (user, pro, client)
- [ ] Dialog / Modal / Drawer
- [ ] Tabs
- [ ] Tooltip / Popover
- [ ] Dropdown menu
- [ ] Toast / Sonner (notifications)
- [ ] Progress bar
- [ ] Skeleton (loading states)
- [ ] Separator

**Deliverable :** tous les composants dans `src/components/ui/` customisés + storybook ou galerie de test dans une route `/design`

---

### Phase 5 — Composants métier (Semaine 6-7)
**Objectif :** Construire les composants propres à Furnish, qui réapparaissent partout.

**Actions :**
- [ ] **ProductCard** — la carte produit (image, nom, prix, statut, quantité, actions) × 3 variants (list, grid, moodboard)
- [ ] **RoomCard** — carte pièce dans la vue "Plan" (nom, stats, photo de couverture, nombre de produits)
- [ ] **ProjectCard** — carte projet dans le dashboard (client, avancement, échéance, statut)
- [ ] **TaskCard** — carte tâche chantier (titre, status, artisan, échéance, priorité, photos)
- [ ] **BriefStep** — étape du wizard de brief
- [ ] **MoodboardCanvas** — la zone de composition drag-drop
- [ ] **PresentationSlide** — layout slide de présentation
- [ ] **ValidationRequestCard** — carte "élément à valider" dans l'espace client
- [ ] **CommentThread** — fil de discussion réutilisable (sur produit, tâche, slide)
- [ ] **BudgetBar** — visualisation budget vs réel
- [ ] **TimelineItem** — élément de timeline projet
- [ ] **ArtisanBadge** — pill indiquant un artisan assigné
- [ ] **PriceTag** — affichage prix avec devise source + conversion € (si différente)

**Deliverable :** composants métier dans `src/components/furnish/` + galerie

---

### Phase 6 — Templates d'écrans (Semaine 8-9)
**Objectif :** Composer les écrans clés avec les composants.

**Actions par écran :**
- [ ] Dashboard pro (multi-projets)
- [ ] Dashboard particulier (1 projet)
- [ ] Vue projet > onglets (Brief / Pièces / Chantier / Sourcing / Présentation / Finance)
- [ ] Vue pièce (moodboard canvas + liste produits)
- [ ] Vue chantier (Kanban + Liste + Calendrier)
- [ ] Vue présentation (mode édition pro + mode lecture client)
- [ ] Espace client (à valider / avancement / documents / messages)
- [ ] Settings utilisateur (Profil / Branding / Bibliothèque / Abonnement)
- [ ] Onboarding (choix persona → création 1er projet → brief light)

**Deliverable :** maquettes hautes-fidélité (Figma OU directement dans le code via Claude/v0.dev)

---

### Phase 7 — Documentation & maintenance (en continu)
**Objectif :** Garder le système vivant.

**Actions :**
- [ ] Doc DESIGN-SYSTEM.md (ce doc) mis à jour à chaque décision
- [ ] Galerie de composants accessible dans l'app à `/design` (dev only)
- [ ] Storybook ou équivalent (optionnel)
- [ ] Guide de contribution : comment ajouter un composant, règles de naming, quand créer une variante vs un nouveau composant
- [ ] Audit mensuel : rechercher les duplications, les incohérences

---

## Outils recommandés

| Besoin | Outil | Pourquoi |
|--------|-------|----------|
| Inspirations | Dribbble, Behance, Mobbin, Page Flows | Exhaustif |
| Moodboards | Are.na, Cosmos, Pinterest, Figma | Curation |
| Design file | Figma | Standard + plugins IA |
| Génération rapide | v0.dev (Vercel) | Stack identique (React + shadcn + Tailwind) |
| Prototypage | Claude artifacts, Bolt.new | Itération rapide |
| Composants | shadcn/ui | Déjà en place, customisable à 100 % |
| Icônes | Lucide React | Standard shadcn |
| Illustrations | Custom / Storyset / Humaaans | À décider |
| Palette | Tailwind, Radix Colors, Realtime Colors | Outils de génération |
| Typo | Google Fonts, Fontshare, Pangram Pangram | Sources fiables |
| Animations | Framer Motion, Motion One | Micro-interactions |

---

## Ce dont j'ai besoin de toi pour commencer

1. **3 sites/produits dont tu adores le design** (tout domaine confondu) → calibre ton goût
2. **Ton envie de direction** : "éditorial sobre" (Linear, Notion) vs "chaleureux magazine" (Kinfolk, Atelier Vime) vs "contemporain architecte" (Are.na, Cosmos)
3. **5 mots** qui devraient décrire la marque Furnish
4. **Des "non"** : ce que tu ne veux SURTOUT PAS que Furnish ressemble (évitez la dérive "startup bleue générique", le "Canva-esque", etc.)
5. **Contrainte éventuelle** : Furnish doit-il ressembler à Bordeluche (si oui, on s'inspire de la charte Bordeluche existante) ou totalement indépendant ?

---

# PARTIE B — Le Design System (à remplir)

## Direction Artistique
> À remplir après la Phase 1.

**Moodboard de référence :** *(à venir)*

**5 mots-clés de marque :** *(à venir)*

**À éviter :** *(à venir)*

---

## Brand

**Nom :** Furnish

**Tagline :** *(à définir)*

**Logo :** *(à venir)*

**Ton éditorial :**
- *(à venir — ex: "précis, chaleureux, pro, jamais jargonnant")*

---

## Palette

> À remplir après Phase 2.

**Primaire :** `#______` — usage : CTA, focus, accent
**Secondaire :** `#______` — usage : highlights
**Neutres (gris) :**
- `gray-50` : `#______`
- `gray-100` : `#______`
- `gray-200` : `#______`
- `gray-500` : `#______`
- `gray-900` : `#______`

**Sémantiques :**
- Success : `#______`
- Warning : `#______`
- Error : `#______`
- Info : `#______`

---

## Typographie

> À remplir après Phase 2.

**Police d'affichage (titres) :** *(à choisir)*
**Police de texte (body) :** *(à choisir)*
**Police mono (chiffres) :** *(optionnelle)*

**Échelle :**
| Usage | Taille | Line-height | Poids |
|-------|--------|-------------|-------|
| Display | 56px | 1.1 | 500 |
| H1 | 40px | 1.2 | 500 |
| H2 | 32px | 1.25 | 500 |
| H3 | 24px | 1.3 | 500 |
| H4 | 20px | 1.4 | 500 |
| Body L | 18px | 1.6 | 400 |
| Body | 16px | 1.6 | 400 |
| Body S | 14px | 1.5 | 400 |
| Caption | 12px | 1.4 | 400 |

*(valeurs suggérées, à valider)*

---

## Fondamentaux

> À remplir après Phase 3.

**Espacement :** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (multiples de 4)

**Radius :**
- None : 0
- Small : 4px (boutons, inputs)
- Medium : 8px (cartes)
- Large : 12px (modales)
- Pill : 9999px (badges, tags)

**Ombres :**
- none
- subtle : `0 1px 2px rgba(0,0,0,0.04)`
- elevated : `0 4px 12px rgba(0,0,0,0.06)`
- floating : `0 16px 40px rgba(0,0,0,0.08)`

**Icônes :** Lucide React (24px par défaut, 16px pour inline, 32px pour hero)

**Grille :**
- Container max : 1440px
- Colonnes : 12
- Gap : 24px

---

## Composants UI

> À remplir au fil de la Phase 4. Chaque composant décrit :
> - Variants disponibles
> - States (default, hover, focus, disabled, error, loading)
> - Règles d'utilisation
> - Exemples de code

*(à venir)*

---

## Composants métier

> À remplir au fil de la Phase 5.

*(à venir)*

---

## Templates d'écrans

> À remplir au fil de la Phase 6.

*(à venir)*

---

## Historique du design system

| Date | Décision |
|------|----------|
| 2026-04-17 | Création du doc + plan d'action |
