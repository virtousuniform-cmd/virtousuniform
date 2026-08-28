"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSocialLinksAction } from "../actions/settings.actions";
import type { SocialLinksSetting } from "../repositories/settings.repository";

export function SocialLinksForm({ defaultValues }: { defaultValues: SocialLinksSetting }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<SocialLinksSetting>({ defaultValues });

  async function onSubmit(values: SocialLinksSetting) {
    setSubmitting(true);
    const result = await updateSocialLinksAction(values);
    setSubmitting(false);
    if (result.success) toast.success("Social links updated.");
    else toast.error(result.error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social links</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" placeholder="https://linkedin.com/company/…" {...register("linkedin")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" placeholder="https://facebook.com/…" {...register("facebook")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="twitter">X / Twitter</Label>
            <Input id="twitter" placeholder="https://x.com/…" {...register("twitter")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" placeholder="https://instagram.com/…" {...register("instagram")} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              <Save /> Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
