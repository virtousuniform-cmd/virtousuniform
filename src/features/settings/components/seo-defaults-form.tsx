"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSeoDefaultsAction } from "../actions/settings.actions";
import type { SeoDefaultsSetting } from "../repositories/settings.repository";

export function SeoDefaultsForm({ defaultValues }: { defaultValues: SeoDefaultsSetting }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<SeoDefaultsSetting>({ defaultValues });

  async function onSubmit(values: SeoDefaultsSetting) {
    setSubmitting(true);
    try {
      const result = await updateSeoDefaultsAction(values);
      if (result.success) {
        toast.success("SEO defaults updated.");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Couldn't reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default SEO metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="siteTitle">Homepage title</Label>
            <Input id="siteTitle" {...register("siteTitle")} />
            <p className="text-xs text-muted-foreground">
              Used as the &lt;title&gt; on the homepage specifically.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="titleTemplate">Title template for other pages</Label>
            <Input id="titleTemplate" {...register("titleTemplate")} />
            <p className="text-xs text-muted-foreground">
              Use <code>%s</code> as a placeholder — e.g. &ldquo;%s | Company Name&rdquo;
              becomes &ldquo;About Us | Company Name&rdquo; on the About page.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="defaultDescription">Default meta description</Label>
            <Textarea id="defaultDescription" rows={3} {...register("defaultDescription")} />
            <p className="text-xs text-muted-foreground">
              Used as a fallback on any page that doesn&apos;t set its own description.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ogImage">Default social share image URL</Label>
            <Input id="ogImage" {...register("ogImage")} placeholder="https://…" />
            <p className="text-xs text-muted-foreground">
              Shown when the homepage is shared on social media / messaging apps.
            </p>
          </div>

          <Button type="submit" disabled={submitting}>
            <Save /> Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
