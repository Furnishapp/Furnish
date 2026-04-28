# Furnish — Architecture

> Comment les briques techniques s'articulent. Pour la liste des outils, voir [`TECH-STACK.md`](./TECH-STACK.md).
> *Dernière mise à jour : 27 avril 2026*

---

## Vue système (haut niveau)

```
                          ┌────────────────────────────┐
                          │   Browser (Next.js client) │
                          │   React 19 + Tailwind v4   │
                          └──────────────┬─────────────┘
                                         │
                                  HTTPS  │  (Server Components + RSC fetch)
                                         │
                          ┌──────────────▼─────────────┐
                          │      Vercel Edge / Node    │
                          │     Next.js 15 App Router  │
                          │                            │
                          │  ┌──────────────────────┐  │
                          │  │ Server Components    │  │
                          │  │ Server Actions       │  │
                          │  │ Route Handlers (API) │  │
                          │  └──────────┬───────────┘  │
                          └─────────────┼──────────────┘
                                        │
              ┌─────────────────────────┼──────────────────────────┐
              │                         │                          │
              ▼                         ▼                          ▼
   ┌──────────────────┐    ┌─────────────────────────┐    ┌──────────────────┐
   │ Supabase         │    │  Edge Functions         │    │  External APIs   │
   │                  │    │  (Deno)                 │    │                  │
   │ • Postgres       │    │ • product-scraper       │    │ • Stripe         │
   │ • Auth           │    │ • stripe-webhook        │    │ • Resend (email) │
   │ • Storage        │    │ • email-trigger         │    │ • Cloudinary*    │
   │ • Realtime       │    │ • presentation-export   │    │                  │
   │ • Row Level Sec  │    └─────────────────────────┘    └──────────────────┘
   └──────────────────┘
```

*Cloudinary à confirmer en V1.

---

## Frontières et responsabilités

### Next.js (Vercel)

**Responsable de** :
- Rendu UI (Server Components par défaut, Client Components pour interactivité)
- Auth check côté serveur via Supabase Auth
- Server Actions pour les mutations simples (création projet, ajout produit)
- Route Handlers pour les endpoints publics (présentation par token, webhooks)
- Cache (RSC + TanStack Query côté client)

**N'est PAS responsable de** :
- Logique async lourde (scraping, génération PDF) → Edge Functions
- Stockage des images → Supabase Storage
- Validation paiement → Stripe + webhook

### Supabase

**Responsable de** :
- Source de vérité données (Postgres)
- Auth (email/password, magic links pour clients invités)
- Storage (images mood, photos avant, PDFs générés)
- Realtime (V3 — collaboration temps réel sur projets)
- RLS = sécurité au niveau DB, pas au niveau app

**Pourquoi RLS et pas seulement de l'app-level auth** : la sécurité au niveau DB protège même si le code app a un bug. Toute requête depuis le client passe le filtre, sans exception.

### Edge Functions Supabase (Deno)

**Quand on les utilise** :
- Tâches asynchrones isolées du runtime Next.js
- Scraping de produits (timeout possible, ne doit pas bloquer le serveur web)
- Webhooks Stripe (latence réduite, indépendant des déploiements Vercel)
- Génération de PDF (export devis, export présentation)
- Envoi d'emails déclenchés par triggers DB (ex. nouveau commentaire client)

**Pourquoi Edge plutôt que API Routes Next.js** : isolation des dépendances, scaling indépendant, on peut redéployer une fonction sans redéployer toute l'app, et on évite de cold-starter un container Vercel pour un job async de 30s.

### Stripe

**Responsable de** :
- Stockage cartes (PCI compliance déléguée)
- Calcul TVA (Stripe Tax)
- Source de vérité abonnements (notre table `subscriptions` est une projection synchronisée)
- Émission factures PDF officielles

---

## Flux de données — exemples clés

### 1. Sourcing — paste d'une URL produit

```
1. User colle URL dans le panneau "Ajouter produit"  [Client Component]
2. Action React → POST /api/products/scrape          [Route Handler Next.js]
3. Route Handler → invoke Edge Function product-scraper
4. Edge Function (Deno) :
     - fetch(URL)
     - parse OG tags + JSON-LD
     - fallback DOM (cheerio/jsdom)
     - retourne { title, description, image, price, currency, supplier }
5. Route Handler reçoit, INSERT INTO products via Drizzle
6. Réponse JSON → React invalide la TanStack Query 'products:list'
7. UI rafraîchit la liste produits
```

**Pourquoi Edge Function et pas Server Action** : un scrape peut prendre 5-15 secondes sur un site lent, on ne veut pas bloquer un slot serveur Next.js.

### 2. Auth — login pro

```
1. User → /login → form email + password               [Client Component]
2. Submit → Server Action callable                     [Server Action]
3. supabase.auth.signInWithPassword()
4. Cookie httpOnly Supabase posé sur response
5. Redirect vers /dashboard
6. /dashboard est Server Component, lit cookie, query 'projects'
7. RLS filtre : user voit uniquement projets de ses orgs
```

### 3. Présentation publique (no-login client)

```
1. Pro génère présentation → INSERT INTO presentations avec share_token UUID
2. Pro partage URL : https://furnish.app/p/[share_token]
3. Client clique → page Server Component                [/p/[share_token]/page.tsx]
4. SELECT * FROM presentations WHERE share_token = ...
5. RLS policy "anon_read_by_token" autorise la lecture sans auth
6. Page rendue côté serveur, hydratation client minimale
7. Client clique "Valider" → POST /api/presentations/[token]/validate
   → INSERT INTO comments + UPDATE room_product_links.client_status
8. Trigger DB → Edge Function email-trigger envoie email au pro via Resend
```

**Sécurité** : le token UUID 16 bytes est secret. Pas d'enum-attaquable. Si fuite → le pro peut révoquer en générant un nouveau token (V1.5).

### 4. Stripe — paiement Premium one-shot particulier

```
1. User Free atteint la limite → CTA "Débloquer ce projet"
2. Server Action → stripe.checkout.sessions.create({ mode: 'payment' })
3. Redirect vers Stripe Checkout
4. User paie → Stripe redirige vers /success?session_id=...
5. Stripe envoie webhook 'checkout.session.completed'
   → Edge Function stripe-webhook
   → INSERT INTO project_billing
   → UPDATE projects SET premium_locked_at = now(),
                        edit_window_ends_at = now() + interval '12 months'
6. /success Server Component lit le project, confirme le déblocage
```

---

## Organisation du code (Next.js App Router)

```
src/
├── app/
│   ├── (auth)/                    ← routes publiques d'auth
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/                     ← routes authentifiées
│   │   ├── layout.tsx             ← guard auth + sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── projects/[id]/
│   │   │   ├── page.tsx           ← vue projet
│   │   │   ├── brief/page.tsx
│   │   │   ├── rooms/[roomId]/page.tsx
│   │   │   ├── presentation/page.tsx
│   │   │   └── quote/page.tsx
│   │   └── settings/...
│   ├── (public)/                  ← routes publiques sans auth
│   │   ├── p/[shareToken]/page.tsx ← présentation publique
│   │   └── pricing/page.tsx
│   └── api/                       ← Route Handlers
│       ├── products/scrape/route.ts
│       ├── webhooks/stripe/route.ts
│       └── presentations/[token]/validate/route.ts
│
├── components/
│   ├── ui/                        ← shadcn components (copy-paste)
│   ├── projects/
│   ├── rooms/
│   └── presentations/
│
├── lib/
│   ├── db/                        ← Drizzle schema + queries
│   │   ├── schema.ts
│   │   ├── queries/
│   │   └── migrations/
│   ├── supabase/                  ← clients (server, client, admin)
│   ├── stripe/                    ← typed wrappers Stripe SDK
│   ├── scraper/                   ← logique scraper (côté Edge Function)
│   └── utils/
│
├── stores/                        ← Zustand stores (UI state pur)
│
└── types/                         ← types TS partagés
```

**Convention** : chaque fonctionnalité a ses queries DB dans `lib/db/queries/[domain].ts`, ses composants dans `components/[domain]/`, ses Server Actions colocalisées avec la page qui les appelle.

---

## Server Components vs Client Components

**Par défaut : Server Component.** On bascule en `"use client"` uniquement si :
- Interactivité (onClick, onChange, useState, useEffect)
- Hooks tiers nécessitant le navigateur (TanStack Query côté client, dnd-kit, etc.)
- Browser-only APIs (window, localStorage)

**Pattern récurrent** : page = Server Component qui fetch les données, passe en props à un Client Component pour l'interactivité.

```tsx
// app/(app)/projects/[id]/page.tsx — Server Component
export default async function ProjectPage({ params }) {
  const project = await getProject(params.id);   // SQL côté serveur
  return <ProjectView project={project} />;      // Client Component
}
```

---

## State management

| Type de state | Outil | Exemple |
|---|---|---|
| Données serveur (cachées, refetch) | TanStack Query | Liste produits, projets, briefs |
| Mutations vers serveur | Server Actions + React Action State | Créer projet, sauvegarder brief |
| State UI éphémère | `useState` | Panneau ouvert, hover, focus |
| State UI partagé entre composants | Zustand | Sidebar collapsed, theme, undo stack |
| Form state | react-hook-form + zod | Tous les formulaires |

**Règle** : on ne met JAMAIS de données serveur dans Zustand. TanStack Query est la source de vérité côté client.

---

## Sécurité

### RLS (Row Level Security)

Toutes les tables ont RLS activé. Politique standard :
- Lecture / écriture autorisée si l'utilisateur appartient à l'organization
- Présentations publiques lisibles via `share_token` sans auth

Détails dans [`DATA-MODEL.md`](./DATA-MODEL.md) section RLS.

### Secrets

- Tous les secrets dans Vercel env vars (jamais dans le code)
- Service role Supabase **uniquement** dans Edge Functions et Server Actions, jamais exposé au client
- Webhooks Stripe vérifiés via signature HMAC

### CORS / CSP

- App = single origin `furnish.app`
- API Routes ouvertes seulement aux fetch internes (cookie auth Supabase)
- Webhooks Stripe whitelisted par signature (pas de CORS, accès direct)

---

## Observabilité

| Niveau | Outil | Quand |
|---|---|---|
| Erreurs runtime | Sentry | V1 dès le premier client |
| Logs serveur Next.js | Vercel logs natifs | Toujours |
| Logs Edge Functions | Supabase Functions logs | Toujours |
| Analytics produit | Plausible ou PostHog | V1 |
| Performance | Vercel Speed Insights | V1 |
| Database query time | Supabase dashboard | À monitorer mensuellement |

---

## Déploiements & environnements

| Env | URL | Branch Git | Supabase |
|---|---|---|---|
| Local | `localhost:3000` | feature branch | Supabase local CLI ou branche dev |
| Preview | `*-furnish.vercel.app` | toutes les PR | Supabase branch preview |
| Prod | `furnish.app` | `main` | Supabase prod |

**Règle d'or** : aucune feature ne touche `main` sans avoir tourné en preview avec une vraie DB Supabase preview branch.

---

## Décisions ouvertes

- [ ] Sentry vs Better Stack vs natif Vercel pour le monitoring d'erreurs
- [ ] Plausible vs PostHog (cf. [`TECH-STACK.md`](./TECH-STACK.md))
- [ ] Edge Function vs Cloud Run pour le scraping si volumétrie monte
- [ ] CDN images : Supabase Storage direct, ou Cloudinary, ou Next.js Image avec custom loader

---

*Voir [`TECH-STACK.md`](./TECH-STACK.md) pour les outils, [`DATA-MODEL.md`](./DATA-MODEL.md) pour le schéma DB.*
