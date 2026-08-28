"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import slugify from "slugify";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { galleryAlbumFormSchema, type GalleryAlbumFormValues } from "../schemas/gallery.schema";
import { createGalleryAlbumAction } from "../actions/gallery-album.actions";

export function CreateAlbumForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GalleryAlbumFormValues>({ resolver: zodResolver(galleryAlbumFormSchema) });

  function handleTitleBlur() {
    const title = watch("title");
    if (!watch("slug") && title) {
      setValue("slug", slugify(title, { lower: true, strict: true }));
    }
  }

  async function onSubmit(values: GalleryAlbumFormValues) {
    setSubmitting(true);
    const result = await createGalleryAlbumAction(values);
    setSubmitting(false);

    if (result.success) {
      toast.success("Album created.");
      reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create album</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} onBlur={handleTitleBlur} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={submitting}>
              <Plus /> Create album
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
