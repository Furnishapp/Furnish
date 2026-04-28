# Furnish — Tech Stack

> Liste des technologies, libraries et services utilisés. Pour le « comment ils s'articulent », voir [`ARCHITECTURE.md`](./ARCHITECTURE.md).
> *Dernière mise à jour : 27 avril 2026*

---

## Principes de choix

1. **Boring tech.** On choisit des outils éprouvés, documentés, avec une grosse communauté. Furnish vendra de la déco, pas de la R&D.
2. **Pas de lock-in propriétaire critique.** Postgres > Firebase. Stripe parce que standard.
3. **Coût marginal faible.** Vercel free / Supabase free / Stripe à la transaction. Pas de gros forfait fixe avant les premiers payants.
4. **TypeScript partout.** Pas de JS vanilla en production, pas de Python.
5. **Server-first.** Server Components Next.js par défaut, client uniquement si nécessaire (interactivité).

---

## Frontend

| Outil | Version | Rôle | Pourquoi |
|---|---|---|---|
| **Next.js** | 15.x (App Router) | Framework full-stack | Server Components, Edge Runtime, ISR, déploiement Vercel natif. App Router obligatoire (pas de migration future). |
| **React** | 19 | UI library | Imposé par Next 15. |
| **TypeScript** | 5.x strict | Typage | Non négociable. `strict: true` activé. |
| **Tailwind CSS** | v4 | Styling utility-first | Plus rapide que CSS modules, design tokens partagés via CSS vars. v4 = config CSS-native, plus de `tailwind.config.ts`. |
| **shadcn/ui** | latest | Composants headless | Copiés dans le repo (pas une dépendance), donc 100 % contrôle. Radix UI sous le capot. |
| **TanStack Query** | v5 | State serveur | Cache/refetch/invalidate. Couvre 80 % du state. |
| **Zustand** | v5 | State client UI | Pour le state purement UI (panneaux ouverts, drafts, drag-drop). Pas de Redux. |
| **Lucide React** | latest | Icônes | Tree-shakable, cohérent avec shadcn/ui. |
| **react-hook-form + zod** | latest | Formulaires | RHF pour la perf, zod pour la validation. Le couple gagnant en 2026. |
| **dnd-kit** | latest | Drag-and-drop | Plus moderne que react-dnd. Utilisé pour les canvas et le réordonnancement de slides. |

---

## Backend / data

| Outil | Rôle | Pourquoi |
|---|---|---|
| **Supabase** | Postgres managé + Auth + Storage + Edge Functions + Realtime | Stack tout-en-un, RLS native, prix prévisible, postgres standard donc pas de lock-in profond. Open source. |
| **Drizzle ORM** | ORM TypeScript | Plus léger que Prisma, génère des migrations SQL lisibles, full type-inference. |
| **PostgreSQL** | 15+ | DB principale | Imposé par Supabase. JSONB, RLS, indexes partiels. |

### Pourquoi Drizzle vs Prisma ?

- Prisma = couche d'abstraction lourde, runtime engine en Rust à embarquer
- Drizzle = SQL-first, plus proche de ce que la DB exécute, plus facile à debugger
- Migrations Drizzle versionnées dans `migrations/` — lisibles, reviewable en PR
- Coup de cœur communauté en 2025-2026, on suit le mouvement

---

## Services tiers

| Service | Rôle | Plan envisagé |
|---|---|---|
| **Vercel** | Hosting Next.js + Edge Functions | Hobby au démarrage, Pro dès le MVP V1 (analytics, équipe, environnements) |
| **Supabase** | Backend complet | Pro dès la V1 (point-in-time recovery + branches preview) |
| **Stripe** | Billing (subs + one-shot + Tax) | Standard 1.4 % + 0.25 € par transaction EU. Stripe Tax pour la TVA auto. |
| **Resend** | Emails transactionnels | 3 000 emails/mois free, scale linéaire après. React Email pour le templating. |
| **Cloudinary** *(à confirmer)* | Image optim + CDN | Alternative envisagée à Supabase Storage pour les transformations à la volée. Décision avant V1. |
| **Sentry** | Monitoring erreurs | Plan free pour démarrer, dès qu'il y a 5 clients on prend le Team. |
| **Plausible** ou **PostHog** | Analytics produit | Plausible si on veut juste pageviews respectueuses ; PostHog si on a besoin de feature flags + funnels. À trancher en V1. |

---

## Scraping / extraction produit

| Outil | Rôle |
|---|---|
| **Cheerio** | Parsing HTML server-side, léger |
| **jsdom** *(fallback)* | DOM complet pour les sites qui injectent du contenu via JS |
| **Open Graph parser** | Extraction métadonnées OG en priorité |
| **fetch (native)** | Pas d'axios, on reste sur le standard web |

Le scraper tourne dans une **Edge Function Supabase** (Deno) pour ne pas bloquer le main thread Next.js. Détails dans [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Dev tooling

| Outil | Rôle |
|---|---|
| **pnpm** | Package manager — plus rapide et plus économe que npm/yarn |
| **Biome** *(à confirmer)* | Linter + formatter all-in-one (alternative à ESLint + Prettier). Décision avant V1. |
| **Vitest** | Tests unitaires |
| **Playwright** | Tests E2E (à activer en V1.5, pas avant) |
| **GitHub Actions** | CI/CD (lint + tests + type-check sur PR) |

---

## Dépendances explicitement RÉFUSÉES

| Outil | Raison du refus |
|---|---|
| Firebase | Lock-in propriétaire, pas de SQL |
| Prisma | Trop lourd, runtime engine, migrations moins claires |
| Redux / RTK | Inutilement complexe pour notre besoin |
| Material UI / Chakra | Ne s'aligne pas avec le besoin de DA custom |
| jQuery | Nope |
| Lottie | Pas d'animations lourdes au MVP |
| Three.js / R3F | Pas de 3D propriétaire au MVP (cf. anti-roadmap) |
| Sanity / Contentful | Pas de CMS — la donnée vit en Postgres |

---

## Versionning & contraintes

- **Node** : version LTS stable (24.x à ce stade), définie dans `.nvmrc`
- **Lockfile** : `pnpm-lock.yaml` versionné, jamais `--no-frozen-lockfile` en prod
- **Mises à jour** : Renovate Bot pour PR auto, jamais de mise à jour majeure sans plan de test

---

## Décisions ouvertes

- [ ] Cloudinary vs Supabase Storage pur pour les images (transformations à la volée vs simplicité)
- [ ] Plausible vs PostHog pour analytics
- [ ] Biome vs ESLint+Prettier pour le linting
- [ ] Stripe Tax automatique vs gestion manuelle TVA FR

---

*Voir [`ARCHITECTURE.md`](./ARCHITECTURE.md) pour comprendre comment ces briques s'articulent.*
