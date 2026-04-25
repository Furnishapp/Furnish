# Furnish

End-to-end project management for interior designers — from client brief to final sign-off.

## Live URL

https://v0-furnish.vercel.app/

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI (via shadcn/ui) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Auth & DB | Supabase (PostgreSQL + Auth + Storage) |
| ORM | Drizzle ORM |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Notifications | Sonner |
| Runtime | Bun |
| Testing | Vitest + Playwright |

## Page Architecture

```
/                                             Public landing page
/sign-in                                      Sign in  (toggle → sign up)
/sign-in?mode=signup                          Sign up  (pre-selected)

/projects                                     Projects list           [protected]
/projects/[projectId]                         Project workspace       [protected]
  └─ tab: brief                               Client brief capture
  └─ tab: plan                                Room canvas + mood board
  └─ tab: budget                              Budget & product management
  └─ tab: slides                              Slide deck editor

/projects/[projectId]/rooms/[roomId]          Room detail + products  [protected]
/projects/[projectId]/present                 Presentation mode       [protected]

/shared/[token]                               Public shared presentation (no auth)
/admin                                        Admin dashboard
```

## Project Workflow

1. **Client Brief** — capture vision, style preferences, and requirements
2. **Idea Board** — mood boards and inspiration per room
3. **Slide Deck** — polished client-ready presentations
4. **Validation** — feedback and approval at every stage
5. **Budget & Sign-off** — transparent cost breakdown + digital signature
6. **Product Planning** — source and track every product, fabric, and finish

## Database Schema

```
projects          id, userId, name, description
  └── rooms       id, projectId, name, positionX/Y, moodColors[], moodImages[]
        └── room_links   id, roomId, linkId, positionX/Y, width, height, status

links             id, userId, url, title, description, image, price

shared_presentations   id, projectId, shareToken, slidesData (jsonb)
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# PostgreSQL (Drizzle ORM)
DATABASE_URL=

# Optional — Cloudinary image optimisation
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional — Resend email notifications
RESEND_API_KEY=
```

## Local Development

```bash
# Install dependencies
bun install

# Apply database migrations
bun run db:migrate

# Start dev server (http://localhost:8080)
bun run dev
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server on port 8080 |
| `bun run build` | Production build |
| `bun run lint` | ESLint check |
| `bun run test` | Unit tests (Vitest) |
| `bun run test:e2e` | E2E tests (Playwright) |
| `bun run db:generate` | Generate Drizzle migration |
| `bun run db:migrate` | Apply migrations |
| `bun run db:studio` | Open Drizzle Studio |
