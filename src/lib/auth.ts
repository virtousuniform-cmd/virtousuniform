import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/resend";

/**
 * Central Better Auth configuration.
 *
 * Roles (see prisma schema `Role` enum): SUPER_ADMIN, ADMIN, EDITOR, CUSTOMER.
 * New sign-ups always default to CUSTOMER — admin roles are granted manually
 * or via the admin > users management screen, never through public signup.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh every 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        input: false, // never settable by the client
      },
      phone: { type: "string", required: false },
      companyName: { type: "string", required: false },
      country: { type: "string", required: false },
      isActive: { type: "boolean", defaultValue: true, input: false },
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },

  advanced: {
    database: {
      generateId: false, // let Prisma's cuid() generate IDs
    },
    // Explicit rather than relying on Better Auth's implicit defaults —
    // secure (HTTPS-only) cookies in production, and SameSite=Lax as a
    // baseline CSRF defense layered on top of Next.js's own Origin-header
    // check for Server Actions. Strict would break the email-verification
    // and password-reset links (they navigate here from an email client,
    // a cross-site top-level navigation that Strict cookies wouldn't send
    // credentials on), so Lax is the correct choice here, not a weaker
    // fallback.
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
