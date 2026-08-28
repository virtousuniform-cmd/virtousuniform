# Gloves Manufacturing Platform — Setup & Working Guide

This covers everything needed to get the project running locally, deployed to production, and understanding how it actually works under the hood.

---

## 1. What's in the box

A B2B manufacturing website + admin system built on Next.js 16, with every module from the original spec implemented end-to-end: public marketing site, product catalog, RFQ (request-for-quotation) workflow, blog, gallery, certifications, testimonials, a CMS-driven homepage, full authentication, a customer dashboard, and an admin backend with role-based access control, audit logging, and site settings.

Nothing in the public site is hardcoded HTML pretending to be content — products, blog posts, testimonials, FAQs, gallery media, certificates, and the homepage sections all come from the database and are editable from `/admin`.

---

## 2. Prerequisites

You'll need accounts/tools for:

| Tool | Purpose | Link |
|---|---|---|
| Node.js 20+ | Runtime | nodejs.org |
| pnpm (recommended) or npm | Package manager | `npm install -g pnpm` |
| Supabase account | Postgres database + file storage | supabase.com |
| Resend account | Transactional email (verification, RFQ notifications) | resend.com |
| Vercel account | Deployment (optional for local dev) | vercel.com |

---

## 3. Local setup, step by step

### 3.1 Extract and install

Extract the zip somewhere with a short path (e.g. `C:\dev\gloves-platform` on Windows — deeply nested folders like Desktop subfolders can hit path-length limits later).

```bash
cd gloves-platform
pnpm install
```

**If you're on Windows and see `[ERR_PNPM_IGNORED_BUILDS]`** after install — newer pnpm versions block package build/install scripts by default, and Prisma's client generation is one of them (this is required, not optional):

```bash
pnpm approve-builds
```

Use spacebar to select at least `@prisma/client`, `prisma`, `esbuild`, `sharp`, and `unrs-resolver`, press Enter, then run `pnpm install` again so the approved scripts actually execute.

**Windows PowerShell note:** if any instructions (including AI-assisted ones) tell you to run `rm -rf .next` to clear the build cache, that's bash syntax and won't work in PowerShell. Use instead:
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### 3.2 Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**.
2. Once created, go to **Project Settings → Database**. You need two connection strings:
   - **Connection pooling** (port 6543, has `?pgbouncer=true`) → this is `DATABASE_URL`
   - **Direct connection** (port 5432) → this is `DIRECT_URL` (Prisma needs this for migrations)

   Add two extra tuning parameters to the pooled URL — this avoids intermittent "server has closed the connection" errors against Supabase's free-tier pooler:
   ```
   DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=20"
   ```
3. Go to **Project Settings → API**. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (⚠️ keep secret, server-only) → `SUPABASE_SERVICE_ROLE_KEY`

### 3.3 Create the storage bucket

In Supabase, go to **Storage** → **New Bucket**:
- Name: `gloves-platform` (must match `SUPABASE_STORAGE_BUCKET` in your `.env`)
- Public bucket: **Yes** (product images, certificates, and gallery media are meant to be publicly viewable)

No further policy setup is required for the public bucket to work with the app's server-side uploads, since all uploads go through the service-role key (`src/lib/supabase.ts`), which bypasses Row Level Security.

### 3.4 Set up Resend (email)

1. Sign up at [resend.com](https://resend.com), verify a sending domain (or use their test domain while developing).
2. Create an API key → `RESEND_API_KEY`.
3. Set `RESEND_FROM_EMAIL` to an address on your verified domain.

### 3.5 Configure environment variables

```bash
cp .env.example .env
```

Generate a Better Auth secret:

```bash
openssl rand -base64 32
```

Fill in `.env` with everything from steps 3.2–3.4 plus the generated secret. `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` should both be `http://localhost:3000` for local dev.

### 3.6 Set up the database

```bash
pnpm db:push      # creates all tables from prisma/schema.prisma
pnpm db:seed      # seeds homepage sections, a sample product, FAQs, a testimonial
```

### 3.7 Create your first admin account

**Important:** the seed script does *not* create a login-able admin user. Better Auth stores hashed passwords in a separate `accounts` table that only gets populated through its actual sign-up flow — not through a raw database insert. So:

```bash
pnpm dev
```

1. Go to `http://localhost:3000/register` and create a normal account with your email.
2. Check your terminal / Resend dashboard for the verification email and click the link (or, in development, you can manually set `emailVerified = true` for your user in Supabase's Table Editor if you don't want to wire up email yet).
3. Promote that account to super admin:

```bash
pnpm promote:admin you@example.com
```

4. Log in and visit `http://localhost:3000/admin` — you now have full access.

### 3.8 You're running

- Public site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Customer dashboard: `http://localhost:3000/dashboard`
- Prisma Studio (visual DB browser): `pnpm db:studio`

---

## 4. How it works (architecture)

### 4.1 Folder structure

```
src/
  app/                      Routes, grouped by audience
    (public)/                Marketing site — no auth required
    (auth)/                  Login, register, password reset
    (customer)/dashboard/    Requires any signed-in user
    (admin)/admin/           Requires SUPER_ADMIN / ADMIN / EDITOR role
    api/auth/[...all]/       Better Auth's catch-all handler
  features/                 One folder per domain (products, rfq, blog, ...)
    <domain>/
      schemas/                Zod validation — shared by forms and server actions
      repositories/            ALL Prisma queries live here, nowhere else
      actions/                 Server Actions — the only thing the UI calls
      services/                Cross-cutting orchestration (email, notifications)
      components/              Domain-specific UI
  components/
    ui/                       Reusable primitives (button, input, table, ...)
    layout/                   Site header/footer, admin/customer shells
    motion/                   Reveal, TiltCard, AnimatedCounter (see §5)
    shared/                   Cross-feature UI (pagination, page hero)
  lib/                       auth.ts, prisma.ts, supabase.ts, resend.ts, utils.ts
prisma/
  schema.prisma              The entire data model (30 models)
  seed.ts                    Sample content
scripts/
  promote-admin.ts           Bootstrap your first admin (see §3.7)
```

**The layering rule, strictly followed everywhere:** `component → action → repository → Prisma`. Components never import Prisma directly. This means swapping databases later, or adding caching, touches one layer without rippling through the UI.

### 4.2 Authentication & permissions

- **Better Auth** (`src/lib/auth.ts`) handles sign-up, sign-in, email verification, and password reset. Public registration always creates a `CUSTOMER` — there's no public path to an admin role.
- Four roles exist: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `CUSTOMER` (see the `Role` enum in `prisma/schema.prisma`).
- **Two layers of protection:**
  1. `src/middleware.ts` — a fast, edge-level check that a session cookie exists at all, before the page even starts rendering.
  2. Every admin/customer page's `layout.tsx` re-verifies the *real* session against the database and checks the role. This second check is the actual security boundary — middleware alone is never trusted for authorization.
- **Server Actions** additionally call `requireAdmin()` or `requireAuth()` (in `src/lib/auth-guards.ts`) at the top of every mutation, so even a request that somehow bypassed the UI can't perform an unauthorized write. Role changes specifically require `requireSuperAdmin()` — a regular Admin or Editor cannot grant themselves or anyone else elevated access.

### 4.3 The RFQ (Request for Quotation) flow

This is the core business flow: a visitor browses `/products`, clicks **Request a Quotation**, and lands on `/request-quote` with that product pre-selected. Submitting creates an `Rfq` row with a generated reference number (`RFQ-2026-000123`), fires a confirmation email to the customer, notifies every admin (both by email and as an in-app notification), and appears in `/admin/rfqs`. From there, an admin can change its status (New → Under Review → Quoted → ... → Closed) and reply in a threaded conversation that the customer sees on their own dashboard at `/dashboard/rfqs/[id]` — the same `RfqConversation` component renders both sides, just with the bubble alignment flipped.

### 4.4 The CMS-driven homepage

The homepage doesn't exist as static JSX. It's composed at request time from `HomepageSection` rows (`src/features/cms/repositories/homepage.repository.ts`), rendered in order by `src/features/cms/components/sections/index.tsx`. Two kinds of sections:
- **Copy-driven** (Hero, Statistics, CTA) — content is a JSON blob, editable from `/admin/cms` with real forms.
- **Data-driven** (Featured Products, Testimonials, FAQ) — ignore the JSON entirely and pull live rows from their own tables, so there's one source of truth (you manage featured products from the Products screen, not a duplicate CMS field).

### 4.5 File uploads

All uploads (product images, gallery photos/videos, certificates) go through Server Actions that use the Supabase **service role** client (`src/lib/supabase.ts`) — never the browser-exposed anon key — so there's no need to hand-write storage RLS policies for the app to work.

---

## 5. About the animations & visual polish

The brief asked for a colorful, animated, "3D" feel without sacrificing speed — those two goals are in tension (heavy WebGL scenes are exactly what tanks Lighthouse scores), so here's what was actually built and why:

- **Real 3D, CSS-only** (`src/components/motion/tilt-card.tsx`) — cards tilt toward the cursor using `perspective` + `rotateX/rotateY` CSS transforms driven by pointer position. This is genuine 3D transformation, GPU-composited, with zero animation-library overhead and no persistent JS animation loop — it only computes on `pointermove`. Used on the homepage's featured products and the hero's floating trust badges.
- **GSAP** (`src/features/cms/components/sections/hero-visual.tsx`) — used exactly where the original spec asked for it: a scripted entrance timeline for the hero's floating cards. It's loaded via `next/dynamic` with `ssr: false`, so it doesn't add to the server-rendered payload or block first paint.
- **Motion (Framer Motion's successor)** (`src/components/motion/reveal.tsx`, `animated-counter.tsx`) — scroll-triggered fade/slide reveals (`Reveal`, `RevealGroup`) and count-up statistics. Every reveal uses `viewport: { once: true }`, so it fires once and stops costing anything on scroll-back.
- **Color** — added a vibrant accent trio (cyan/violet/amber) and a brand gradient/mesh system in `globals.css` (`bg-gradient-brand`, `bg-gradient-mesh`, `text-gradient-brand` utility classes) layered on top of the industrial deep-blue/steel-gray base from the original spec, so the site reads as premium and lively rather than flat corporate blue.
- **Accessibility** — every custom animation respects `prefers-reduced-motion` globally (see the media query at the bottom of `globals.css`).

**If you want full WebGL 3D** (a rotating product model, particle backgrounds, etc.), that's a deliberate next step rather than something silently included, because it has real costs: it pulls in `three`/`@react-three/fiber` (adds meaningfully to bundle size), needs its own loading/fallback strategy, and is easy to get wrong on low-end mobile devices. If you want it, the cleanest path is a single `<Canvas>` component dynamically imported with `ssr: false` (same pattern as `HeroVisual`), scoped to just the hero, with a static image fallback for reduced-motion users.

---

## 6. Deploying to production (Vercel)

1. Push this repo to GitHub/GitLab.
2. In Vercel: **New Project** → import the repo.
3. Add all the same environment variables from your `.env`, but pointed at production values:
   - `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` → your real domain
   - Same Supabase/Resend credentials (or a separate production Supabase project — recommended)
4. Deploy. Vercel auto-detects Next.js.
5. After the first deploy, run against production:
   ```bash
   DATABASE_URL="<prod-url>" DIRECT_URL="<prod-direct-url>" pnpm db:push
   DATABASE_URL="<prod-url>" DIRECT_URL="<prod-direct-url>" pnpm db:seed
   ```
6. Register + promote your production admin the same way as §3.7, against the production URL.

Vercel Analytics and Speed Insights are already wired into `src/app/layout.tsx` — no extra setup needed once deployed on Vercel.

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| "Can't reach database server" | Your Supabase project likely auto-paused (free tier pauses after inactivity) — go to the dashboard and **Restore** it. Otherwise, double check `DATABASE_URL`/`DIRECT_URL` — pooled (6543) vs direct (5432) are easy to mix up. |
| "Server has closed the connection" mid-request | Usually a stale pooled connection after idle time — restart `pnpm dev`. Add `connection_limit=1&pool_timeout=20` to `DATABASE_URL` (see §3.2) to make this far less frequent. |
| `[ERR_PNPM_IGNORED_BUILDS]` during install | Run `pnpm approve-builds`, select Prisma and the others, then `pnpm install` again. See §3.1. |
| Windows: page looks completely unstyled (plain black text, underlined links, no layout) | Confirm `postcss.config.mjs` exists in your project root (not nested in `src/`) and that `pnpm install` completed successfully. Hard-refresh (Ctrl+Shift+R) after fixing. |
| A form (sign in, register, etc.) gets stuck showing "Signing in…" forever with no error | This should be fixed in this build (all auth forms use try/catch/finally now), but if you still see it, open DevTools → Network tab, click the button again, and check the failing request's status code — that pinpoints the real cause immediately. |
| Image uploads fail | Confirm the `gloves-platform` bucket exists and is public, and `SUPABASE_SERVICE_ROLE_KEY` is set (not the anon key). |
| Can't log in after seeding | Expected — see §3.7. The seed script intentionally doesn't create a credentialed user. |
| Emails not sending | In development without a verified Resend domain, your account can only deliver to the email you signed up to Resend with. Check the **Emails** tab in the Resend dashboard for the actual delivery status/error on every send attempt. |
| "Unauthorized" on an admin page | Your account's `role` is still `CUSTOMER`. Run `pnpm promote:admin <email>` again, or promote via `/admin/users` if you already have one super admin. |
| Role dropdown disabled on `/admin/users` | Only `SUPER_ADMIN` can change roles — that's intentional (see §4.2). |
| Logged-in admin/editor lands on the wrong dashboard after sign-in | Should route automatically now — staff → `/admin`, customers → `/dashboard`. If it doesn't, confirm your account's `role` field is actually set correctly (check via `pnpm db:studio`). |

---

## 8. What's still a "next step," honestly

To set expectations: a handful of static marketing pages (About, Manufacturing Process, Why Choose Us, etc.) are routed and SEO-tagged but carry placeholder copy pending real content — the page shells and structure are done, the writing isn't. Rich-text editing (Tiptap) isn't wired in yet; long-form fields (product descriptions, blog content) are plain textareas for now. Both are called out inline in the relevant component files so they're easy to find and finish.

Visual design is intentionally left at "clean and functional" rather than fully art-directed — colors, animations (GSAP/Motion), and 3D tilt effects exist on the public homepage, but a dedicated polish pass (especially for the admin panel's visual density) is a good next round rather than something to rush.

## 9. Admin panel — full page map

Every link in the admin sidebar now resolves to a real, database-backed page:

| Section | Pages |
|---|---|
| General | Overview (`/admin`) |
| Catalog | Products, Categories |
| People | Users (staff), Customers |
| Sales | RFQs, Messages, Notifications |
| Content | Blog, Gallery, Certifications, Testimonials, Homepage CMS |
| System | SEO, Analytics, Settings, Audit Logs |
| Account | My Profile (`/admin/profile`) — accessible from the header dropdown, not the sidebar |

Staff (`SUPER_ADMIN`/`ADMIN`/`EDITOR`) are routed straight to `/admin` on login; customers to `/dashboard`. Every admin page has a **Visit Website** button in the header (opens the public site in a new tab) to immediately verify any edit.
