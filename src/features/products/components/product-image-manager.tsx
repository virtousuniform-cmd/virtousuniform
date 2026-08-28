"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  uploadProductImageAction,
  removeProductImageAction,
} from "../actions/product-image.actions";

type ProductImage = { id: string; url: string; altText: string | null };

export function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const [items, setItems] = useState(images);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadProductImageAction(productId, formData);
      if (result.success) {
        setItems((prev) => [...prev, { id: crypto.randomUUID(), url: result.data.url, altText: null }]);
        toast.success("Image uploaded.");
      } else {
        toast.error(result.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleRemove(imageId: string) {
    startTransition(async () => {
      const result = await removeProductImageAction(imageId, productId);
      if (result.success) {
        setItems((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {items.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border border-border">
              <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                disabled={isPending}
                className="absolute top-1 right-1 rounded-full bg-background/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="size-3.5 text-destructive" />
              </button>
            </div>
          ))}

          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted/50">
            <Upload className="size-5" />
            <span className="text-xs">Upload</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          WEBP, JPEG, or PNG — up to 5MB. First image is used as the primary thumbnail.
        </p>
      </CardContent>
    </Card>
  );
}
