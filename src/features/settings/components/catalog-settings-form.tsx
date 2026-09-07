"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateCatalogSettingsAction } from "../actions/settings.actions";
import type { CatalogSettings } from "../repositories/settings.repository";
import { cn } from "@/lib/utils";

export function CatalogSettingsForm({ defaultValues }: { defaultValues: CatalogSettings }) {
  const [submitting, setSubmitting] = useState(false);
  const { handleSubmit, setValue, watch } = useForm<CatalogSettings>({
    defaultValues,
  });

  async function onSubmit(values: CatalogSettings) {
    setSubmitting(true);
    const result = await updateCatalogSettingsAction(values);
    setSubmitting(false);
    if (result.success) toast.success("Catalog display settings updated.");
    else toast.error(result.error);
  }

  const FIELDS: { id: keyof CatalogSettings; label: string; description: string }[] = [
    { id: "showMaterial", label: "Material", description: "The primary fabric or material composition." },
    { id: "showCoating", label: "Coating", description: "Protective coating or finish applied." },
    { id: "showProtectionLevel", label: "Protection Level", description: "Cut ratings, heat resistance, etc." },
    { id: "showApplications", label: "Applications", description: "Industry use cases and sectors." },
    { id: "showFeatures", label: "Key Features", description: "Bulleted list of highlights." },
    { id: "showColors", label: "Colors", description: "Available color options." },
    { id: "showSizes", label: "Sizes", description: "Available size range." },
    { id: "showPackaging", label: "Packaging", description: "How the item is packed (e.g. 12 pairs/poly)." },
    { id: "showMoq", label: "MOQ", description: "Minimum Order Quantity." },
    { id: "showWeight", label: "Weight", description: "Weight per pair or per carton." },
    { id: "showSku", label: "SKU", description: "Product Stock Keeping Unit." },
    { id: "showModelNumber", label: "Model Number", description: "Manufacturer's model reference." },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catalog Display Settings</CardTitle>
        <CardDescription>
          Choose which product fields are visible to the public. Hidden fields will still be editable in Admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((field) => (
              <div key={field.id} className="flex items-center justify-between gap-4 rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <Label className="text-base">{field.label}</Label>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {watch(field.id) ? (
                    <Eye className="size-4 text-brand" />
                  ) : (
                    <EyeOff className="size-4 text-muted-foreground" />
                  )}
                  <input
                    type="checkbox"
                    className="size-5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                    checked={!!watch(field.id)}
                    onChange={(e) => setValue(field.id, e.target.checked)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 size-4" /> Save Visibility Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
