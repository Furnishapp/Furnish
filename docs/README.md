# Furnish — Documentation produit

> Source de vérité unique sur la vision, le scope, l'architecture, les features de Furnish.
> *Toute évolution majeure passe par une PR.*

---

## Structure

```
docs/
├── specs/          ← stratégie produit & business (le quoi / pour qui / pourquoi)
├── architecture/   ← spécifications techniques (le comment)
└── features/       ← spec détaillée par feature (le quoi en détail)
```

---

## `specs/` — Stratégie & business

| Document | Quoi |
|---|---|
| [`specs/VISION.md`](./specs/VISION.md) | Promesse, cible, JTBD, North Star Metric, différenciateur |
| [`specs/MVP-SCOPE.md`](./specs/MVP-SCOPE.md) | Périmètre IN / OUT du MVP V1 figé |
| [`specs/ROADMAP.md`](./specs/ROADMAP.md) | Phases V0 → V3, jalons, dépendances |
| [`specs/PERSONAS.md`](./specs/PERSONAS.md) | 4 personas cibles + cas Bordeluche |
| [`specs/PRICING.md`](./specs/PRICING.md) | Formules Pro / Premium / Free, anti-abus, monétisation |
| [`specs/BRAND.md`](./specs/BRAND.md) | Nom, tagline, ton éditorial, voix produit |

---

## `architecture/` — Spécifications techniques

| Document | Quoi |
|---|---|
| [`architecture/TECH-STACK.md`](./architecture/TECH-STACK.md) | Liste des technos et libs utilisées + raisons |
| [`architecture/ARCHITECTURE.md`](./architecture/ARCHITECTURE.md) | Diagramme système, frontières, flux de données |
| [`architecture/DATA-MODEL.md`](./architecture/DATA-MODEL.md) | Schéma DB cible, RLS, activation par phase |

---

## `features/` — Specs feature par feature

| Document | Quoi |
|---|---|
| [`features/brief-form.md`](./features/brief-form.md) | Formulaire de brief client (12 champs MVP) |

> Les autres feature specs sont créées progressivement, **au moment où la feature démarre en dev**, pas en avance. Voir la liste des features candidates dans la section ci-dessous.

### Features à documenter au fil du build

| Feature | Quand |
|---|---|
| `sourcing.md` | V0 — paste URL, scraper, OG, fallback manuel |
| `presentations.md` | V0 — auto-génération slides, share token, public view |
| `client-validation.md` | V1 — flow no-login, validation, commentaires |
| `quotes.md` | V2 — génération PDF, format légal FR |
| `stripe-billing.md` | V1 — abonnements, trial, anti-abus, webhooks |
| `moodboards.md` | V0 — canvas, drag-drop, palette |
| `team-collaboration.md` | V3 — invitations équipe, RBAC |

---

## Conventions

- Format Markdown GitHub-flavored
- Date de mise à jour en en-tête de chaque doc
- Tout changement structurel passe par PR avec review
- Décisions ouvertes listées en fin de chaque doc
- Cross-references via liens relatifs (`./`, `../`)
- Nommage : `kebab-case.md` pour les features, `MAJUSCULES.md` pour les docs foundationals

---

## À venir

| Document | Statut |
|---|---|
| `architecture/MIGRATION-PLAN.md` | À créer au démarrage V0→V1 — plan détaillé de migration |
| `architecture/decisions/` | À créer — ADR log pour les choix tech au fil du build |
| Feature specs progressives | À créer feature par feature |
