import "server-only";

/**
 * Rate limiting for public, unauthenticated Server Actions (RFQ and
 * contact form submission). These are reachable by direct POST from
 * anyone — Next.js's CSRF protection (Origin/Host header check) stops
 * cross-site forgery, but does nothing to stop a script hammering the
 * same endpoint directly. See the security audit notes in GUIDE.md.
 *
 * Two modes:
 *  - Upstash Redis configured (UPSTASH_REDIS_REST_URL/TOKEN in .env):
 *    a real, shared, sliding-window limiter that works correctly across
 *    serverless instances.
 *  - Not configured: an in-memory fallback. This is HONEST about its
 *    limitation — serverless platforms (Vercel included) run multiple
 *    isolated instances, so in-memory state is NOT shared between them
 *    and this fallback provides only weak, best-effort protection.
 *    It's suitable for local development and single-instance deployments,
 *    not a substitute for Upstash in production.
 */

type RateLimitResult = { success: boolean; remaining: number };

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

let upstashLimiter: {
  limit: (key: string) => Promise<{ success: boolean; remaining: number }>;
} | null = null;
let upstashInitAttempted = false;

async function getUpstashLimiter() {
  if (upstashInitAttempted) return upstashLimiter;
  upstashInitAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    // Dynamically imported so the app runs fine without these packages
    // installed if Upstash isn't configured — see package.json note.
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({ url, token });
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "10 m"),
      analytics: true,
      prefix: "gloves-platform",
    });

    upstashLimiter = {
      limit: async (key: string) => {
        const result = await ratelimit.limit(key);
        return { success: result.success, remaining: result.remaining };
      },
    };
  } catch (err) {
    console.warn(
      "[rate-limit] Upstash configured but @upstash/ratelimit or @upstash/redis isn't installed. " +
        "Run `pnpm add @upstash/ratelimit @upstash/redis` to enable it. Falling back to in-memory limiting.",
      err,
    );
    upstashLimiter = null;
  }

  return upstashLimiter;
}

// In-memory fallback — a simple fixed-window counter per key.
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: MAX_REQUESTS - entry.count };
}

/**
 * Check + consume one request against the limit for `key` (typically the
 * requester's IP, prefixed with an action name so different forms don't
 * share a budget — see getClientIp() below for how to build the key).
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const upstash = await getUpstashLimiter();
  if (upstash) return upstash.limit(key);
  return memoryLimit(key);
}

/**
 * Best-effort client IP extraction from forwarded headers. Not spoof-proof
 * on its own (a client can set X-Forwarded-For), but Vercel and most
 * reverse proxies overwrite/append this header with the real connecting
 * IP, so the *last* entry (or Vercel's own header) is trustworthy in
 * practice when deployed behind Vercel or a properly configured proxy.
 */
export function getClientIp(headersList: Headers): string {
  const vercelIp = headersList.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0]?.trim() ?? "unknown";

  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";

  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
