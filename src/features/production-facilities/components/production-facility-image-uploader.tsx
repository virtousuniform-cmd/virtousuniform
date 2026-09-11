"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadProductionFacilityImageAction } from "../actions/production-facility.actions";

export function ProductionFacilityImageUploader({
  onImageUrl,
  currentImageUrl,
}: {
  onImageUrl: (url: string) => void;
  currentImageUrl?: string;
}) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadProductionFacilityImageAction(formData);
      if (result.success) {
        setImageUrl(result.data.url);
        onImageUrl(result.data.url);
        toast.success("Image uploaded.");
      } else {
        toast.error(result.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facility Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <Image
              src={imageUrl}
              alt="Facility preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex gap-2">
          <label className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/30 py-6 text-muted-foreground transition-colors hover:bg-muted/50">
            <Upload className="size-5" />
            <span className="text-xs font-medium">
              {isPending ? "Uploading..." : imageUrl ? "Replace" : "Upload"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />
          </label>
          {imageUrl && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setImageUrl("");
                onImageUrl("");
              }}
              disabled={isPending}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          WEBP, JPEG, or PNG — up to 5MB. Recommended aspect ratio: 4:5 or 3:4.
        </p>
      </CardContent>
    </Card>
  );
}
