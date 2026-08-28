import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verify Email" };

/**
 * Better Auth's `emailVerification.sendVerificationEmail` link points at its
 * own `/api/auth/verify-email` endpoint, which validates the token and then
 * redirects here on success (see `emailVerification.autoSignInAfterVerification`
 * in src/lib/auth.ts). This page is the friendly landing state, not the
 * token-validation logic itself.
 */
export default function VerifyEmailPage() {
  return (
    <AuthShell title="Email verified">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <p className="text-sm text-muted-foreground">
          Your email has been verified. You can now sign in to your account.
        </p>
        <Button asChild className="mt-2 w-full">
          <Link href="/login">Continue to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
