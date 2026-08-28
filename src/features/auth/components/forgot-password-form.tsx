"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas/auth.schema";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitting(true);
    setFormError(null);

    try {
      const { data, error } = await (authClient as any).forgetPassword({
        email: values.email,
        redirectTo: "/reset-password",
      });

      console.log("[forgot-password] result:", { data, error });

      // Always show the success state regardless of whether the email exists —
      // never reveal account existence through this form.
      if (error) {
        setFormError("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
        return;
      }
      toast.success("If that account exists, a reset link is on its way.");
      setSubmitted(true);
    } catch (err) {
      console.error("[forgot-password] threw:", err);
      const message =
        "Couldn't reach the server. Confirm the app is running and try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <h3 className="font-medium text-foreground">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          If an account exists for that address, we&apos;ve sent a link to reset your
          password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
