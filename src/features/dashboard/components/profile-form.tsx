"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileFormSchema, type ProfileFormValues } from "../schemas/profile.schema";
import { updateProfileAction } from "../actions/update-profile.action";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileFormValues }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileFormValues) {
    setSubmitting(true);
    const result = await updateProfileAction(values);
    setSubmitting(false);

    if (result.success) {
      toast.success("Profile updated.");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="companyName">Company</Label>
        <Input id="companyName" {...register("companyName")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register("country")} />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
