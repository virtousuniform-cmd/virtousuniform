# Gloves Manufacturing Platform — Scaffold

Production-grade B2B manufacturing website + admin system. This is **Phase 1**
of the build: repository skeleton, database schema, auth, and RBAC wiring.
Pages and UI are stubbed intentionally — they land in the next phases.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 ·
shadcn/ui · Prisma · Supabase (Postgres + Storage) · Better Auth · Zod ·
React Hook Form · TanStack Query/Table · Resend · Motion + GSAP · Recharts ·
Tiptap.

## Architecture

Feature-based, not type-based. Each domain in `src/features/*` owns its
full vertical slice:

```
src/features/<domain>/
  actions/        Server Actions — the only thing UI calls directly
  services/        cross-cutting orchestration (email, notifications)
  repositories/    Prisma queries live here ONLY — nowhere else
  schemas/         Zod validation, shared by client forms + server actions
  components/      domain-specific UI
  hooks/           domain-specific client hooks
```

**Layering rule:** `components → actions → services → repositories → prisma`.
Components never import Prisma directly. Actions never write raw SQL/Prisma
inline — they call a repository. This keeps the domain logic testable and
means swapping Postgres/Supabase later doesn't ripple through the UI.

See `src/features/rfq/` for the reference implementation of this pattern
(schema → repository → server action → notification service), the same
shape to replicate for `products`, `blog`, `gallery`, `testimonials`, etc.

### Route groups

```
src/app/
  (public)/     marketing site — Home, About, Products, Blog, Contact...
  (auth)/       login, register, password reset, email verification
  (customer)/   /dashboard/** — requires session (see layout.tsx)
  (admin)/      /admin/** — requires SUPER_ADMIN | ADMIN | EDITOR role
  api/
    auth/[...all]/   Better Auth catch-all handler
```

### Auth & RBAC

- `src/middleware.ts` — edge-safe cookie presence check, redirects
  unauthenticated users away from `/admin/**` and `/dashboard/**`.
- `(admin)/admin/layout.tsx` and `(customer)/dashboard/layout.tsx` — the
  **real** authorization boundary: a DB-backed session + role lookup via
  `auth.api.getSession()`. Middleware alone is never sufficient for RBAC.
- Roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `CUSTOMER` (see `prisma/schema.prisma`).
  Public sign-up always creates a `CUSTOMER`; admin roles are granted by
  a super admin from `/admin/users`, never through public registration.

### Database

`prisma/schema.prisma` is the single source of truth — normalized, indexed,
soft-deletable where content has a public URL (products, categories, blog
posts). Highlights:

- **Catalog** — `Category` (self-referential, nested), `Product` with
  specs/images/certificates as related tables, not JSON blobs.
- **RFQ** — `Rfq` → `RfqItem`/`RfqAttachment`/`RfqMessage`, full
  conversation history retained per request, never called "Query" in the UI.
- **CMS** — `HomepageSection` (keyed enum + flexible `Json` content) and
  `SiteSetting` so every homepage block and global setting is admin-editable
  with zero hardcoded copy.
- **Audit** — `AuditLog` captures create/update/delete/status-change/login
  events across entities.

### Storage

`src/lib/supabase.ts` exports two clients: `supabasePublic` (anon key,
safe for client reads under RLS) and `supabaseAdmin` (service role, server
-only — used by admin upload actions for product images, certificates,
brochures, catalogues).

## Getting started

```bash
pnpm install                 # or npm/yarn
cp .env.example .env         # fill in Supabase + Resend + Better Auth secret
pnpm db:push                 # push schema to Supabase Postgres
pnpm db:seed                 # seed super admin + sample category/product
pnpm dev
```

Generate a Better Auth secret:

```bash
openssl rand -base64 32
```

## What's next (not yet built)

1. **shadcn/ui components** — run `npx shadcn@latest add button card dialog
   form input select tabs table toast avatar dropdown-menu` etc.
2. **Public pages** — compose each route from CMS data instead of hardcoded
   JSX (see the pattern noted in `(public)/page.tsx`).
3. **Product catalog UI** — listing with filters/search/pagination, product
   detail page, admin CRUD with TanStack Table + Tiptap for rich descriptions.
4. **RFQ UI** — multi-step public form (schema already defined), admin
   inbox + conversation thread view.
5. **Admin dashboard shell** — sidebar, header, Recharts overview widgets.
6. **Emails** — React Email templates in `src/emails/` wired to the
   `src/lib/resend.ts` senders already stubbed out.
7. **Animations** — Motion for micro-interactions, GSAP for hero/scroll
   timelines, applied once the static markup exists.

## Folder map

```
prisma/
  schema.prisma      full data model
  seed.ts             admin + sample content seed
src/
  app/                routes (grouped by public/auth/customer/admin)
  components/
    ui/               shadcn primitives
    layout/            SiteHeader, SiteFooter, AdminSidebar, etc.
    shared/            cross-feature reusable UI
  features/           see "Architecture" above
  lib/                 prisma.ts, auth.ts, auth-client.ts, supabase.ts,
                        resend.ts, utils.ts
  emails/              React Email templates
  middleware.ts
```
