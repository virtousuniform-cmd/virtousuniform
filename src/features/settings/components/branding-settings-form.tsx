"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateBrandingAction, uploadLogoAction } from "../actions/settings.actions";
import type { BrandingSetting } from "../repositories/settings.repository";

export function BrandingSettingsForm({ defaultValues }: { defaultValues: BrandingSetting }) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(defaultValues.logoUrl || "");

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadLogoAction(formData);
    setUploading(false);

    if (result.success) {
      setLogoUrl(result.data.url);
      toast.success("Logo uploaded. Remember to save changes.");
    } else {
      toast.error(result.error);
    }
  }

  async function onSave() {
    setSubmitting(true);
    const result = await updateBrandingAction({ logoUrl });
    setSubmitting(false);

    if (result.success) {
      toast.success("Branding settings updated.");
      window.location.reload(); // Refresh to update all layout components
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding & Visual Identity</CardTitle>
        <CardDescription>
          Manage your company's logo and visual presence across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="space-y-4">
            <label className="text-sm font-medium">Site Logo</label>
            <div className="relative aspect-video w-64 overflow-hidden rounded-xl border-2 border-dashed bg-muted/30 transition-colors hover:bg-muted/50 flex items-center justify-center">
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo Preview" fill className="object-contain p-4" />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="mb-2 size-8" />
                  <p className="px-2 text-center text-xs">No logo uploaded</p>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <Loader2 className="size-6 animate-spin text-brand" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => document.getElementById("logo-upload")?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2 size-4" />
                {logoUrl ? "Replace Logo" : "Upload Logo"}
              </Button>
              {logoUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setLogoUrl("")}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <input
              id="logo-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </div>

          <div className="flex-1 space-y-4 pt-8">
            <div className="rounded-lg bg-primary/5 p-5 text-sm space-y-3">
              <p className="font-semibold text-primary">Logo Guidelines:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-xs leading-relaxed">
                <li><strong>Format:</strong> Use transparent PNG or SVG for best results.</li>
                <li><strong>Shape:</strong> Horizontal (landscape) logos fit the header much better.</li>
                <li><strong>Fallback:</strong> If no logo is uploaded, the site will show "VU Virtuous Uniform" text.</li>
                <li><strong>Live Update:</strong> The page will reload after saving to apply the new logo everywhere.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Logo Storage URL (Internal)</label>
              <input
                type="text"
                readOnly
                className="w-full rounded-md border bg-muted px-3 py-2 text-xs font-mono text-muted-foreground"
                value={logoUrl || "No logo file stored."}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end">
          <Button onClick={onSave} size="lg" disabled={submitting || uploading} className="min-w-[200px]">
            {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Save Branding Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
