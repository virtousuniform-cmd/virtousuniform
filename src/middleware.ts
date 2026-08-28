import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Route protection strategy:
 *  - `/admin/**`      -> requires role in [SUPER_ADMIN, ADMIN, EDITOR]
 *  - `/dashboard/**`  -> requires any authenticated user
 *  - `/login`,`/register` -> redirect away if already authenticated
 *
 * This middleware only checks for session *presence* (fast, edge-safe cookie
 * check). Role-level authorization is re-verified server-side in each
 * layout/action via `auth.api.getSession()` against the DB — middleware
 * must never be the sole authorization boundary.
 */

const ADMIN_PREFIX = "/admin";
const CUSTOMER_PREFIX = "/dashboard";
const GUEST_ONLY_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  if (pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith(CUSTOMER_PREFIX)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Role check (ADMIN vs CUSTOMER) happens in the segment layout via
    // a real DB-backed session lookup — see (admin)/admin/layout.tsx.
  }

  if (GUEST_ONLY_ROUTES.includes(pathname) && isAuthenticated) {
    // Role isn't available from the cookie alone (that would need a DB
    // round-trip inside middleware, which defeats the point of an
    // edge-level check) — send them to the homepage rather than assuming
    // /dashboard, so a staff member doesn't get stranded in the customer
    // dashboard with no path back to /admin. The header/dashboard links
    // take it from there once the real session is resolved server-side.
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
