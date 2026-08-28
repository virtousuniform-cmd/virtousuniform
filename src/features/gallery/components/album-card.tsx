"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, X, Trash2, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  uploadGalleryMediaAction,
  removeGalleryMediaAction,
} from "../actions/gallery-media.actions";
import { deleteGalleryAlbumAction } from "../actions/gallery-album.actions";

type Media = { id: string; url: string; type: "IMAGE" | "VIDEO"; caption: string | null };

export function AlbumCard({
  albumId,
  title,
  description,
  media,
}: {
  albumId: string;
  title: string;
  description: string | null;
  media: Media[];
}) {
  const [items, setItems] = useState(media);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadGalleryMediaAction(albumId, formData);
      if (result.success) {
        setItems((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            url: result.data.url,
            type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
            caption: null,
          },
        ]);
        toast.success("Uploaded.");
      } else {
        toast.error(result.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleRemoveMedia(id: string) {
    startTransition(async () => {
      const result = await removeGalleryMediaAction(id);
      if (result.success) {
        setItems((prev) => prev.filter((m) => m.id !== id));
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDeleteAlbum() {
    if (!confirm(`Delete album "${title}" and all its media?`)) return;
    startTransition(async () => {
      const result = await deleteGalleryAlbumAction(albumId);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={handleDeleteAlbum} disabled={isPending}>
          <Trash2 className="text-destructive" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {items.map((m) => (
            <div
              key={m.id}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
            >
              {m.type === "IMAGE" ? (
                <Image src={m.url} alt={m.caption ?? ""} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <PlayCircle className="size-6 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveMedia(m.id)}
                disabled={isPending}
                className="absolute top-1 right-1 rounded-full bg-background/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                aria-label="Remove media"
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
              accept="image/webp,image/jpeg,image/png,video/mp4,video/webm"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
