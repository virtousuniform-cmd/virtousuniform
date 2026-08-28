import { createAuthClient } from "better-auth/react";

// Fall back to the current origin if NEXT_PUBLIC_APP_URL is missing or
// misconfigured, rather than silently constructing a broken request URL.
// This is a client component, so `window` is always available here.
const baseURL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const authClient = createAuthClient({ baseURL });

export const { signIn, signOut, signUp, useSession, forgetPassword, resetPassword } =
  authClient;
