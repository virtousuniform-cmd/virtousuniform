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

import { blogPostFormSchema, type BlogPostFormValues } from "../schemas/blog.schema";
import { createBlogPostAction, updateBlogPostAction } from "../actions/blog.actions";

type Category = { id: string; name: string };

export function BlogPostForm({
  categories,
  defaultValues,
  postId,
}: {
  categories: Category[];
  defaultValues?: Partial<BlogPostFormValues>;
  postId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!postId;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      status: "DRAFT",
      tags: [],
      seoKeywords: [],
      ...defaultValues,
    },
  });

  const title = watch("title");
  const tagsValue = watch("tags");

  function handleTitleBlur() {
    if (!watch("slug") && title) {
      setValue("slug", slugify(title, { lower: true, strict: true }));
    }
  }

  function handleTagsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(
      "tags",
      e.target.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    );
  }

  async function onSubmit(values: BlogPostFormValues) {
    setSubmitting(true);
    const result = isEditing
      ? await updateBlogPostAction(postId!, values)
      : await createBlogPostAction(values);
    setSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Post updated." : "Post created.");
      router.push(`/admin/blogs/${result.data.id}`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" rows={2} {...register("excerpt")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" rows={12} {...register("content")} />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Rich-text editing (Tiptap) lands in the next pass — plain text for now.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="featuredImage">Featured image URL</Label>
            <Input id="featuredImage" {...register("featuredImage")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={watch("categoryId") || undefined}
              onValueChange={(v) => setValue("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as BlogPostFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {watch("status") === "SCHEDULED" && (
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Publish date</Label>
              <Input id="scheduledAt" type="datetime-local" {...register("scheduledAt")} />
            </div>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              defaultValue={tagsValue?.join(", ")}
              onChange={handleTagsChange}
              placeholder="e.g. safety, export, certification"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle">Meta title</Label>
            <Input id="seoTitle" {...register("seoTitle")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoDescription">Meta description</Label>
            <Input id="seoDescription" {...register("seoDescription")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save /> {isEditing ? "Save changes" : "Create post"}
        </Button>
      </div>
    </form>
  );
}
