"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSectionContentAction } from "../../actions/homepage-section.actions";

type HeroContent = {
  headline: string;
  subheadline?: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export function HeroSectionEditor({ content }: { content: HeroContent }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<HeroContent>({ defaultValues: content });

  async function onSubmit(values: HeroContent) {
    setSubmitting(true);
    const result = await updateSectionContentAction("HERO", values);
    setSubmitting(false);
    if (result.success) toast.success("Hero section updated.");
    else toast.error(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" {...register("headline")} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="subheadline">Subheadline</Label>
        <Input id="subheadline" {...register("subheadline")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ctaPrimary.label">Primary CTA label</Label>
        <Input id="ctaPrimary.label" {...register("ctaPrimary.label")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ctaPrimary.href">Primary CTA link</Label>
        <Input id="ctaPrimary.href" {...register("ctaPrimary.href")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ctaSecondary.label">Secondary CTA label</Label>
        <Input id="ctaSecondary.label" {...register("ctaSecondary.label")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ctaSecondary.href">Secondary CTA link</Label>
        <Input id="ctaSecondary.href" {...register("ctaSecondary.href")} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          <Save /> Save changes
        </Button>
      </div>
    </form>
  );
}
