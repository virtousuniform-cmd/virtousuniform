"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Save, Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { updateSectionContentAction } from "../../actions/homepage-section.actions";

type HeroSlide = {
  image: string;
  headline: string;
  subheadline: string;
};

type HeroContent = {
  slides: HeroSlide[];
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export function HeroSectionEditor({ content }: { content: HeroContent }) {
  const [submitting, setSubmitting] = useState(false);

  // Migration for old data structure if needed
  const initialSlides = content.slides || (content as any).images?.map((img: string) => ({
    image: img,
    headline: (content as any).headline || "",
    subheadline: (content as any).subheadline || "",
  })) || [];

  const { register, control, handleSubmit } = useForm<HeroContent>({
    defaultValues: {
      ...content,
      slides: initialSlides,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "slides",
  });

  async function onSubmit(values: HeroContent) {
    setSubmitting(true);
    const result = await updateSectionContentAction("HERO", values);
    setSubmitting(false);
    if (result.success) toast.success("Hero slider updated.");
    else toast.error(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Slides ({fields.length})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ image: "", headline: "", subheadline: "" })}
          >
            <Plus className="mr-2 size-4" /> Add Slide
          </Button>
        </div>

        {fields.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No slides yet. Add one to get started.
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <MoveUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <MoveDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <CardContent className="grid gap-4 p-4 pt-8 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Background Image URL</Label>
                  <Input {...register(`slides.${index}.image` as const)} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Headline</Label>
                  <Input {...register(`slides.${index}.headline` as const)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Subheadline</Label>
                  <Input {...register(`slides.${index}.subheadline` as const)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 border-t pt-6 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="font-semibold">Global Buttons (Shared across all slides)</Label>
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
      </div>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        <Save className="mr-2 size-4" /> Save Professional Slider
      </Button>
    </form>
  );
}
