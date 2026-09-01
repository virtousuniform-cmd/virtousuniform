"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { createContentPageAction, updateContentPageAction } from "../actions/content-page.actions";

const pageSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  content: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
});

type PageFormValues = z.infer<typeof pageSchema>;

export function ContentPageForm({
  initialData,
  id,
}: {
  initialData?: Partial<PageFormValues>;
  id?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      status: "DRAFT",
      ...initialData,
    },
  });

  const title = watch("title");

  function handleTitleBlur() {
    if (!watch("slug") && title) {
      setValue("slug", slugify(title, { lower: true, strict: true }));
    }
  }

  async function onSubmit(values: PageFormValues) {
    setSubmitting(true);
    const result = isEditing
      ? await updateContentPageAction(id!, values as any)
      : await createContentPageAction(values as any);
    setSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Page updated." : "Page created.");
      router.push("/admin/cms/pages");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {isEditing ? "Edit Page" : "New Page"}
        </h1>
        <Button type="submit" disabled={submitting}>
          <Save className="mr-2 size-4" /> {isEditing ? "Save changes" : "Create page"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Page Title</Label>
                <Input id="title" {...register("title")} onBlur={handleTitleBlur} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input id="slug" {...register("slug")} />
                </div>
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content">Page Content</Label>
                <Textarea id="content" rows={20} {...register("content")} placeholder="HTML or Markdown content..." />
                {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Rich text editor integration planned. For now, use basic HTML tags for formatting.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) => setValue("status", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="seoTitle">Meta Title</Label>
                <Input id="seoTitle" {...register("seoTitle")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea id="seoDescription" rows={3} {...register("seoDescription")} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
