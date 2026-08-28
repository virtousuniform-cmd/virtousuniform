import { z } from "zod";

export const blogPostFormSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().max(300).optional().or(z.literal("")),
  content: z.string().min(10, "Content is required").max(50000),
  featuredImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  scheduledAt: z.string().optional().or(z.literal("")),
  categoryId: z.string().cuid().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),

  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  seoKeywords: z.array(z.string()).default([]),
});

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export const blogCategoryFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategoryFormSchema>;
