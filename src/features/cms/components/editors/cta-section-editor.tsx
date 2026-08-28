"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSectionContentAction } from "../../actions/homepage-section.actions";

type CtaContent = {
  headline: string;
  subheadline?: string;
  cta?: { label: string; href: string };
};

export function CtaSectionEditor({ content }: { content: CtaContent }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<CtaContent>({ defaultValues: content });

  async function onSubmit(values: CtaContent) {
    setSubmitting(true);
    const result = await updateSectionContentAction("CTA", values);
    setSubmitting(false);
    if (result.success) toast.success("CTA section updated.");
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
        <Label htmlFor="cta.label">Button label</Label>
        <Input id="cta.label" {...register("cta.label")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cta.href">Button link</Label>
        <Input id="cta.href" {...register("cta.href")} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          <Save /> Save changes
        </Button>
      </div>
    </form>
  );
}
