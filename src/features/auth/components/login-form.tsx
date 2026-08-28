"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginValues } from "../schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // If middleware sent the user here from a specific protected page
  // (e.g. /login?redirect=/admin/products), honor that exact destination.
  // Otherwise, decide based on role once we know it — staff land on the
  // admin dashboard, everyone else on the customer dashboard.
  const explicitRedirect = searchParams.get("redirect");
  const justRegistered = searchParams.get("registered") === "1";
  const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setFormError(null);

    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      // Debug aid: open the browser console (F12) to see exactly what
      // Better Auth returned if something still looks wrong after this fix.
      console.log("[login] signIn.email result:", { data, error });

      if (error) {
        const message =
          error.message || `Sign in failed (${error.status ?? "unknown error"}).`;
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success("Signed in.");

      if (explicitRedirect) {
        router.push(explicitRedirect);
      } else {
        const role = (data?.user as { role?: string } | undefined)?.role;
        router.push(role && STAFF_ROLES.includes(role) ? "/admin" : "/dashboard");
      }
      router.refresh();
    } catch (err) {
      console.error("[login] signIn.email threw:", err);
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
      {justRegistered && (
        <p className="flex items-start gap-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          Account created successfully. You can now sign in with your credentials.
        </p>
      )}

      {formError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
