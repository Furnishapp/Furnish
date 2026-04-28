# Furnish — Modèle de données

> Schéma cible. Toutes les tables sont créées dès la V1. Les features qui les utilisent s'allument au fil des phases (V1, V1.5, V2, V3) sans nouvelle migration majeure.
> *Dernière mise à jour : 26 avril 2026*

---

## Principes

1. **Pas de big-bang plus tard.** Toutes les tables structurelles sont créées dès le MVP. On évite les migrations massives en V3.
2. **Activation progressive.** Une table peut exister sans être encore branchée à l'UI. Exemple : `comments` est créée en V1 mais l'UI commentaires arrive en V1.5.
3. **UUID partout.** Génération côté client possible, pas de collision sur les réplicas, non-séquentiel donc plus discret.
4. **Soft delete partout** via `deleted_at TIMESTAMPTZ`. Permet l'audit, la restauration, l'archive sans suppression réelle.
5. **JSONB pour la flexibilité non-critique** (palette mood, métadonnées custom). PG colonne typée pour tout ce qui se query (prix, statut, dates).
6. **RLS Supabase activée sur toutes les tables**. Pas d'exception.

---

## Vue d'ensemble

```
auth.users (Supabase managed)
    │
    ├── user_profiles (1-1)             — branding studio, account_type
    ├── subscriptions (1-N)             — état Stripe
    │
    └── organizations (owner_id, 1-N)
          ├── organization_members (1-N) — membres équipe agence
          ├── clients (1-N)              — CRM léger
          ├── products (1-N)             — bibliothèque produit org-scoped
          │
          └── projects (1-N)
                ├── project_briefs (1-1)
                ├── project_participants (1-N)  — collaborateurs + clients invités
                ├── project_billing (1-N)       — one-shots particulier
                ├── activity_logs (1-N)         — audit trail
                ├── comments (1-N)              — sur projet/pièce/produit
                │
                ├── rooms (1-N)
                │     └── room_product_links (1-N)
                │           └── (référence un product de l'org)
                │
                ├── presentations (1-N)
                │     └── presentation_views (1-N) — analytics
                │
                └── quotes (1-N)
                      └── quote_items (1-N)

product_favorites (user-scoped)
```

---

## Tables structurelles

### `user_profiles`

Étend `auth.users` avec les données métier Furnish.

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL DEFAULT 'pro_trial',
    -- pro_trial | pro_active | particulier_free | particulier_premium | admin
  display_name TEXT,
  studio_name TEXT,
  studio_logo_url TEXT,
  studio_primary_color TEXT,
  studio_signature TEXT,           -- HTML signature pour devis/emails
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  locale TEXT NOT NULL DEFAULT 'fr-FR',
  notification_preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `subscriptions`

État Stripe synchronisé via webhooks. Source de vérité pour ce que l'utilisateur peut faire.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
    -- trialing | active | past_due | canceled | incomplete | incomplete_expired
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `organizations`

Une org perso est auto-créée à l'inscription. Un pro peut en posséder plusieurs (studio, agence). Permet la migration douce particulier → pro et le partage entre coéquipiers.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'personal',  -- personal | pro
  logo_url TEXT,
  primary_color TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### `organization_members`

Multi-user agence. Au MVP V1, le owner est l'unique membre. L'invitation s'active en V3.

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',  -- admin | editor | viewer
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
```

### `clients` (CRM léger)

Un client peut être un prospect (sans compte user) ou un user invité plus tard. Scoppé par organization.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  linked_user_id UUID REFERENCES auth.users(id),  -- nullable, FK si compte créé
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'prospect',  -- prospect | active | completed | archived
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### `projects`

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
    -- new | sourcing | presented | approved | delivered | archived
  cover_url TEXT,
  total_budget NUMERIC(10, 2),
  start_date DATE,
  delivery_date DATE,
  -- Verrou anti-abus particulier (cf. ../specs/PRICING.md)
  premium_locked_at TIMESTAMPTZ,    -- date de paiement Premium
  edit_window_ends_at TIMESTAMPTZ,  -- 12 mois après paiement
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### `project_briefs`

Sorti du JSON dans `projects.description`. Permet de queryer (`WHERE budget_max > 50000`).

```sql
CREATE TABLE project_briefs (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  -- Section 1 : projet
  project_type TEXT,                -- renovation | deco | ameublement | construction | staging
  property_type TEXT,               -- appart | maison | local_pro | airbnb
  surface_m2 NUMERIC(6, 2),
  address TEXT,
  -- Section 3 : objectifs
  why_text TEXT,
  vision_text TEXT,
  usages JSONB DEFAULT '[]',
  -- Section 4 : budget
  budget_min NUMERIC(10, 2),
  budget_max NUMERIC(10, 2),
  budget_flexibility TEXT,          -- firm | flex_10 | flex_25 | indicative
  -- Section 5 : style
  styles_wanted JSONB DEFAULT '[]',
  styles_avoided JSONB DEFAULT '[]',
  palette JSONB DEFAULT '[]',
  materials_wanted JSONB DEFAULT '[]',
  materials_avoided JSONB DEFAULT '[]',
  -- Section 6 : documents (URLs Supabase Storage)
  document_urls JSONB DEFAULT '[]',
  -- Section 7 : planning
  planning_flexibility TEXT,
  -- meta
  completion_percent INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  ai_summary TEXT,                  -- résumé IA généré (V1.5)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `project_participants`

Collaboration : membre interne, client invité, etc. Activé pleinement en V1.5.

```sql
CREATE TABLE project_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  invite_email TEXT,                  -- pour invitation pre-signup
  invite_token TEXT UNIQUE,
  role TEXT NOT NULL,
    -- owner | collaborator | client_viewer | client_editor | viewer
  access_level TEXT NOT NULL DEFAULT 'read',
    -- read | comment | edit | admin
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  CHECK (user_id IS NOT NULL OR invite_email IS NOT NULL)
);
```

### `project_billing`

Trace des paiements one-shot pour les particuliers Premium.

```sql
CREATE TABLE project_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ DEFAULT now()
);
```

### `rooms`

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,                          -- living | kitchen | bedroom | bathroom...
  description TEXT,
  surface_m2 NUMERIC(6, 2),
  room_budget NUMERIC(10, 2),
  priority TEXT DEFAULT 'normal',     -- critical | normal | optional
  -- Canvas placement (vue plan logique)
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  width DOUBLE PRECISION DEFAULT 200,
  height DOUBLE PRECISION DEFAULT 150,
  -- Mood
  mood_colors JSONB DEFAULT '[]',
  mood_images JSONB DEFAULT '[]',
  photos_before JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### `products`

Bibliothèque produit. **Scoppée par organization, pas par user.** Permet le partage en équipe (V3) sans refonte.

⚠️ Renommé depuis `links` pour clarté sémantique.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  url TEXT,                           -- nullable : produits manuels (brocante)
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT,
  -- Prix multi-devises
  price NUMERIC(10, 2),
  currency TEXT DEFAULT 'EUR',
  price_eur NUMERIC(10, 2),           -- snapshot conversion à l'ajout
  -- Métadonnées
  supplier TEXT,                      -- nom du retailer
  delivery_days INT,
  tags JSONB DEFAULT '[]',
  is_favorite BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### `room_product_links`

⚠️ Renommé depuis `room_links`. Sépare clairement statut logistique et statut client.

```sql
CREATE TABLE room_product_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  -- Dénormalisation pour requêtes "tous les produits du projet" rapides
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Quantité (essentiel pour le devis)
  quantity INT NOT NULL DEFAULT 1,
  -- Statut logistique
  status TEXT DEFAULT 'idea',
    -- idea | selected | ordered | delivered | installed | removed
  -- Statut validation client (séparé)
  client_status TEXT DEFAULT 'pending',
    -- pending | proposed | approved | rejected | change_requested
  client_status_changed_at TIMESTAMPTZ,
  client_comment TEXT,
  -- Placement sur moodboard
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  width DOUBLE PRECISION DEFAULT 260,
  height DOUBLE PRECISION DEFAULT 200,
  show_caption BOOLEAN DEFAULT TRUE,
  -- Notes pro internes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, product_id)
);
```

### `product_favorites`

Étoile produit perso (V2). Table créée dès V1, UI activée en V2.

```sql
CREATE TABLE product_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
```

### `presentations`

Snapshot de la présentation envoyée au client. Permet plusieurs versions par projet (itérations).

```sql
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  share_token TEXT NOT NULL UNIQUE
    DEFAULT encode(gen_random_bytes(16), 'hex'),
  title TEXT,
  slides_data JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN DEFAULT TRUE,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,           -- compteur rapide
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### `presentation_views`

Analytics fines (V1.5). Table créée dès V1.

```sql
CREATE TABLE presentation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  viewer_ip TEXT,                     -- hashé pour RGPD
  viewer_user_agent TEXT,
  viewer_user_id UUID REFERENCES auth.users(id),  -- si client invité loggé
  slide_index INT,
  duration_seconds INT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);
```

### `quotes`

Devis. Indispensable au MVP. Format légal FR.

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  -- Numérotation continue obligatoire (FR)
  quote_number TEXT NOT NULL,         -- ex: FUR-2026-0001
  status TEXT NOT NULL DEFAULT 'draft',
    -- draft | sent | accepted | refused | expired
  -- Montants
  subtotal_ht NUMERIC(10, 2) NOT NULL,
  vat_rate NUMERIC(5, 2) DEFAULT 20.0,
  vat_amount NUMERIC(10, 2),
  total_ttc NUMERIC(10, 2) NOT NULL,
  margin_percent NUMERIC(5, 2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  -- Conditions
  conditions TEXT,
  legal_mentions TEXT,
  validity_days INT DEFAULT 30,
  -- Snapshot
  pdf_url TEXT,
  sent_to_email TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, quote_number)
);

CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  -- Référence optionnelle au room_product_link source
  room_product_link_id UUID REFERENCES room_product_links(id),
  -- Snapshot des données au moment du devis (immuable)
  description TEXT NOT NULL,
  image_url TEXT,
  quantity INT NOT NULL,
  unit_price_ht NUMERIC(10, 2) NOT NULL,
  total_ht NUMERIC(10, 2) NOT NULL,
  position INT NOT NULL DEFAULT 0
);
```

### `comments`

Polymorphique sur projet / pièce / produit. UI activée en V1.5.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Une seule des trois FK est non-null (CHECK constraint)
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  room_product_link_id UUID REFERENCES room_product_links(id) ON DELETE CASCADE,
  -- Auteur
  author_user_id UUID REFERENCES auth.users(id),
  author_email TEXT,                  -- pour clients non-loggés
  author_name TEXT,
  -- Contenu
  content TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  parent_comment_id UUID REFERENCES comments(id),  -- threads
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### `activity_logs`

Audit trail. Écriture activée en V2.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
    -- product.added | product.approved | room.created | quote.sent | ...
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_logs_project ON activity_logs(project_id, created_at DESC);
```

---

## Activation par phase

| Table | V1 (MVP) | V1.5 | V2 | V3 |
|---|:-:|:-:|:-:|:-:|
| `user_profiles` | ✅ | | | |
| `subscriptions` | ✅ | | | |
| `organizations` | ✅ auto-créée silencieuse | | | ✅ multi-org pro |
| `organization_members` | créée, owner only | | | ✅ invitation équipe |
| `clients` | ✅ | | | |
| `projects` | ✅ | | | |
| `project_briefs` | ✅ | enrichi via IA | personnalisable | |
| `project_participants` | créée | ✅ invitation client | | |
| `project_billing` | créée | | ✅ Premium one-shot | |
| `rooms` | ✅ | | | |
| `products` | ✅ | | | partagé en équipe |
| `room_product_links` | ✅ | | | |
| `product_favorites` | créée | | ✅ étoile UI | |
| `presentations` | ✅ | | | |
| `presentation_views` | créée, compteur simple | ✅ analytics fines | | |
| `quotes` + `quote_items` | ✅ | | | facturation complète |
| `comments` | créée | ✅ UI | | |
| `activity_logs` | créée | | ✅ écriture | UI historique |

---

## Verrou anti-abus particulier

Les colonnes `premium_locked_at` et `edit_window_ends_at` sur `projects` permettent d'enforcer la règle « 12 mois d'édition après paiement, puis lecture seule à vie ».

Logique :
- À l'achat Premium → `premium_locked_at = now()`, `edit_window_ends_at = now() + interval '12 months'`
- À chaque write produit/pièce, vérification : `edit_window_ends_at > now() OR account_type = 'pro_active'`
- Dépassement → erreur « Période d'édition expirée. Le projet est en lecture seule. »

Voir [`../specs/PRICING.md`](../specs/PRICING.md) section anti-abus pour le détail business.

---

## RLS — Stratégie générale

Toutes les tables ont RLS activé. Politiques par défaut :

```sql
-- Utilisateur peut lire/modifier ses ressources via organizations
CREATE POLICY "user_owns_via_org" ON projects
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Présentations : lecture publique par token (anon), modification par owner
CREATE POLICY "anon_read_by_token" ON presentations
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);
```

---

## Index recommandés

```sql
-- Performance critique sur les vues projet
CREATE INDEX idx_projects_org_status ON projects(organization_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_room_product_links_project ON room_product_links(project_id);
CREATE INDEX idx_room_product_links_room ON room_product_links(room_id);
CREATE INDEX idx_products_org_favorite ON products(organization_id, is_favorite)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_presentations_token ON presentations(share_token)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_org_number ON quotes(organization_id, quote_number);
CREATE INDEX idx_clients_org_status ON clients(organization_id, status)
  WHERE deleted_at IS NULL;
```

---

## Migration depuis le schéma V0 actuel

Le code actuel utilise `links` et `room_links`. Migration en 3 étapes :

1. **Renommer** `links` → `products`, `room_links` → `room_product_links`. Ajouter colonnes manquantes (currency, supplier, quantity, client_status, etc.)
2. **Auto-créer** une organisation perso pour chaque user existant. Migrer `links.user_id` → `products.organization_id` via mapping user → org.
3. **Migrer** le brief stocké en JSON dans `projects.description` vers `project_briefs` via parser.

Détails dans le plan de migration (à produire en `MIGRATION-PLAN.md` quand on démarrera).

---

## Décisions ouvertes

- [ ] **Numérotation des devis** : par organisation (recommandé) ou par utilisateur ? Implique 1 séquence Postgres par org.
- [ ] **Stockage images** : Supabase Storage par défaut, ou Cloudinary pour transformation ? Décision à prendre avant V1.
- [ ] **Conversion devises** : on-write avec API (open exchange rates) ou recalcul daily cron ? Impact perf + fraîcheur.
- [ ] **Hash des mots de passe présentation** : bcrypt côté Edge Function ou tout simplement éviter cette feature au MVP ?
