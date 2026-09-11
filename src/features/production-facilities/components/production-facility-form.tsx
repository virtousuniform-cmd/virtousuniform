"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createProductionFacilityAction,
  updateProductionFacilityAction,
} from "../actions/production-facility.actions";
import { ProductionFacilityImageUploader } from "./production-facility-image-uploader";
import type { ProductionFacility } from "@prisma/client";

export function ProductionFacilityForm({
  facility,
}: {
  facility?: ProductionFacility;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState(facility?.imageUrl || "");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!imageUrl) {
      toast.error("Please upload an image.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const input = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      imageAlt: (formData.get("imageAlt") as string) || null,
      displayOrder: parseInt((formData.get("displayOrder") as string) || "0"),
      isActive: formData.get("isActive") === "on",
      imageUrl,
    };

    startTransition(async () => {
      const result = facility
        ? await updateProductionFacilityAction(facility.id, input)
        : await createProductionFacilityAction(input);

      if (result.success) {
        toast.success(
          facility ? "Facility updated." : "Facility created."
        );
        router.push("/admin/production-facilities");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <ProductionFacilityImageUploader
        onImageUrl={setImageUrl}
        currentImageUrl={facility?.imageUrl}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {facility ? "Edit Facility" : "Add Facility"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., R&D, Cutting, Printing, Stitching, Quality Control"
              defaultValue={facility?.title || ""}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of this production stage (optional)"
              defaultValue={facility?.description || ""}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageAlt">Image Alt Text</Label>
            <Input
              id="imageAlt"
              name="imageAlt"
              placeholder="e.g., R&D team working on glove design"
              defaultValue={facility?.imageAlt || ""}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min="0"
                defaultValue={facility?.displayOrder || 0}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="isActive" className="flex items-center gap-2">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  defaultChecked={facility?.isActive !== false}
                  className="h-4 w-4 rounded border-border"
                />
                Active
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {facility ? "Update Facility" : "Create Facility"}
        </Button>
      </div>
    </form>
  );
}
