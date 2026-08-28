"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterValues } from "../schemas/auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    // Validate on blur (so a field shows its error as soon as you tab away
    // from it, not only after a failed submit) and then re-check on every
    // keystroke after that, so the error clears the moment it's fixed.
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: RegisterValues) {
    setSubmitting(true);
    setFormError(null);

    try {
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        // Better Auth's `user.additionalFields` (see src/lib/auth.ts) accepts
        // these on sign-up; they're stored on the User row directly.
        companyName: values.companyName || undefined,
        country: values.country || undefined,
        autoLogin: false,
      });

      // Debug aid: open the browser console (F12) to see exactly what
      // Better Auth returned if something still looks wrong after this fix.
      console.log("[register] signUp.email result:", { data, error });

      if (error) {
        const message =
          error.message || `Registration failed (${error.status ?? "unknown error"}).`;
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success("Account created! You can now sign in.");
      router.push("/login?registered=1");
      router.refresh();
    } catch (err) {
      console.error("[register] signUp.email threw:", err);
      const message =
        "Couldn't reach the server. Confirm the app is running and NEXT_PUBLIC_APP_URL in your .env matches the URL you're visiting, then try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* <p className="flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
        <MailWarning className="mt-0.5 size-4 shrink-0" />
        After creating your account, we&apos;ll email you a verification link.
        It can take a few minutes to arrive — check your spam/junk folder too,
        and wait a little before requesting another one.
      </p> */}

      {formError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Jane Smith"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">
            Company <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input id="companyName" placeholder="Acme Inc." {...register("companyName")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">
            Country <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input id="country" placeholder="Pakistan" {...register("country")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
