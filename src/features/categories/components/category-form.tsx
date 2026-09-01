"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import slugify from "slugify";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { categoryFormSchema, type CategoryFormValues } from "../schemas/category.schema";
import { createCategoryAction, updateCategoryAction } from "../actions/category.actions";

type CategoryOption = { id: string; name: string };

export function CategoryForm({
  categories,
  defaultValues,
  categoryId,
}: {
  categories: CategoryOption[];
  defaultValues?: Partial<CategoryFormValues>;
  categoryId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!categoryId;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { isVisible: true, sortOrder: 0, ...defaultValues },
  });

  function handleNameBlur() {
    const name = watch("name");
    if (!watch("slug") && name) {
      setValue("slug", slugify(name, { lower: true, strict: true }));
    }
  }

  async function onSubmit(values: CategoryFormValues) {
    setSubmitting(true);
    try {
      const result = isEditing
        ? await updateCategoryAction(categoryId!, values)
        : await createCategoryAction(values);

      if (result.success) {
        toast.success(isEditing ? "Category updated." : "Category created.");
        router.push("/admin/categories");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // A category can't be its own parent, and (to keep the tree simple) can't
  // be parented under one of its own descendants either — the repository
  // only nests one level deep in the UI today, so filtering self is the
  // meaningful guard here.
  const parentOptions = categories.filter((c) => c.id !== categoryId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Category details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} onBlur={handleNameBlur} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="space-y-1.5">
            <Label>Parent category</Label>
            <Select
              value={watch("parentId") || undefined}
              onValueChange={(v) => setValue("parentId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None — top level" />
              </SelectTrigger>
              <SelectContent>
                {parentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-4 sm:col-span-2">
            <div className="flex items-center gap-2">
              <input
                id="isVisible"
                type="checkbox"
                className="size-4 rounded border-input"
                {...register("isVisible")}
              />
              <Label htmlFor="isVisible" className="font-normal">
                Visible on the public site
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isFeaturedOnHome"
                type="checkbox"
                className="size-4 rounded border-input"
                {...register("isFeaturedOnHome")}
              />
              <Label htmlFor="isFeaturedOnHome" className="font-normal">
                Feature on Homepage (Redesigned Category Grid)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save /> {isEditing ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
