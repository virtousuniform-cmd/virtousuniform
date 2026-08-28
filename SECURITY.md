# Security Audit

Conducted against the current codebase. Findings are grouped by severity. "Fixed" means the code in this repo now reflects the fix; "Recommendation" means it's flagged for you to decide on, with reasoning for why it wasn't silently auto-applied.

---

## Critical

### Next.js middleware bypass (CVE-2025-29927) — confirmed mitigated by design

A CVSS 9.1 vulnerability disclosed in 2025 allowed attackers to skip Next.js middleware entirely (including auth checks) by sending a crafted `x-middleware-subrequest` header. Patched in current Next.js versions, but worth stating explicitly: **this codebase was never solely dependent on middleware for authorization in the first place.**

- `src/middleware.ts` does a fast, edge-level cookie-presence check — nothing more.
- Every protected layout (`(admin)/admin/layout.tsx`, `(customer)/dashboard/layout.tsx`) independently calls `auth.api.getSession()` — a real database round-trip — before rendering any child page.
- Every Server Action additionally calls `requireAdmin()`, `requireAuth()`, or `requireSuperAdmin()` (`src/lib/auth-guards.ts`) at the top of the function body.

Even in a hypothetical world where middleware were fully bypassed, none of these three layers depend on it. This is defense-in-depth working as intended, not luck — but confirm your `next` version is current (`pnpm outdated next`) as a matter of course.

---

## High

### No rate limiting on public Server Actions — Fixed

`createRfqAction` and `createContactMessageAction` are unauthenticated, public endpoints reachable by direct POST request (Server Actions are, functionally, public API endpoints — Next's own docs say this explicitly). Neither had any rate limiting. An attacker could script thousands of submissions per minute, each one triggering a database write and a Resend email send — a real cost, not just noise.

**Fixed**: added `src/lib/rate-limit.ts` — Upstash Redis-backed sliding-window limiter (5 requests / 10 minutes per IP) when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are configured, with an honest in-memory fallback for local development. The fallback is explicitly documented as **not sufficient for a serverless production deployment** (Vercel runs multiple isolated instances that don't share memory) — configure Upstash before relying on this in production. A free Upstash tier is enough for this traffic volume.

Also added a honeypot field to the RFQ form (`rfq-form.tsx`/`rfq.schema.ts`) — the contact form already had one, the RFQ form didn't, despite being equally public.

Login/registration were already protected — Better Auth's own `rateLimit` config (`src/lib/auth.ts`) caps auth attempts at 20/minute.

### Missing Content-Security-Policy — Fixed

`next.config.ts` had solid baseline headers (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS) but no CSP at all — meaning a successful XSS injection anywhere in the app had no additional barrier stopping it from loading an external script or exfiltrating data to an arbitrary origin.

**Fixed**: added a CSP restricting `script-src`/`connect-src`/`img-src`/`font-src` to self plus the specific third parties actually in use (Supabase, Vercel Analytics). It intentionally still allows `'unsafe-inline'` for scripts and styles rather than switching to a nonce-based strict policy — a nonce-based CSP is stronger, but implementing it correctly requires generating a per-request nonce in middleware and threading it through every script tag, which is easy to get subtly wrong (and silently break Next's own hydration) without testing against a live deployment. **Recommendation**: if you want to close this gap fully, that's the next step, done as its own tested change — not bundled into an unverifiable batch of edits.

---

## Medium

### File uploads trust the browser-supplied MIME type

`uploadProductImageAction`, `uploadGalleryMediaAction`, and `uploadCertificateAction` all validate `file.type` against an allow-list before upload. This is real validation, but `file.type` is set by the browser based on the file extension / a client-supplied value — not verified against the file's actual binary content (magic bytes). A malicious actor could rename a script to `.webp` and have it pass this check.

**Recommendation, not fixed**: mitigating this fully means reading the first few bytes of each uploaded buffer and checking them against known magic-byte signatures per format (e.g. `sharp`'s metadata reader, or a small library like `file-type`). This is a real gap worth closing before accepting uploads from untrusted (i.e. lower-trust admin/editor, not just customer) users at scale, but every upload path already requires `requireAdmin()` first — so the practical exposure today is limited to your own staff accounts, not the general public. Sizing this as a deliberate next step rather than rushing a magic-byte check I can't test against real files right now.

### Server Action closures — confirmed clean

A known Next.js Server Action pitfall: defining an action inline inside a component can capture sensitive variables from the surrounding scope, which Next.js then serializes into an encrypted client-side reference — if that encryption were ever compromised, captured secrets leak. **Audit result: every Server Action in this codebase is defined in its own file** (the `actions/*.ts` pattern used throughout every feature folder), never inline in a component. This pitfall doesn't apply here.

---

## Low / Confirmed Good

- **CSRF**: Next.js Server Actions automatically compare the Origin and Host headers on every POST, blocking standard cross-site request forgery. No custom API routes bypass this.
- **SQL injection**: not applicable — every database query goes through Prisma's parameterized query builder; there is no raw SQL anywhere in the codebase.
- **Authorization checks**: audited every admin/staff Server Action — all call `requireAdmin()` or stricter (`requireSuperAdmin()` for role changes specifically). Ownership checks are present where they matter (e.g. `sendRfqMessageAction` verifies the caller owns the RFQ or is staff before allowing a reply).
- **Password policy**: minimum 8 characters enforced by Better Auth (`minPasswordLength: 8`), hashing handled entirely by Better Auth — no custom crypto written for this project.
- **Session cookies**: made explicit rather than relying on implicit defaults — `useSecureCookies: true` in production (HTTPS-only), `SameSite=Lax` (the correct choice here specifically because Strict would break email verification / password reset links, which arrive via a cross-site top-level navigation from an email client), `httpOnly: true`.
- **Secrets handling**: `.env` is git-ignored; the service-role Supabase key is only ever used in server-only files (`src/lib/supabase.ts`'s `supabaseAdmin` client) and never exposed to the browser bundle.
- **Error message hygiene**: client-facing error messages are generic ("Something went wrong"); full error details are only ever `console.error`'d server-side, not returned to the client.
- **Audit logging**: every meaningful admin mutation writes an `AuditLog` row — reviewable at `/admin/audit-logs`.

---

## Dependency notes (not exploits, just flagged)

`pnpm install` surfaces deprecation warnings for `@react-email/components` and `recharts` (both on older major versions, still functional and maintained enough for now). Not a security finding on their own, but worth a `pnpm outdated` pass periodically — an unmaintained dependency becomes a security problem the moment a CVE is found in it and never patched.
