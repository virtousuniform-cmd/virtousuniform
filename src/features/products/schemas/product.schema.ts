import { z } from "zod";

export const productSpecificationSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  value: z.string().min(1, "Value is required").max(300),
});

export const productFormSchema = z.object({
  name: z.string().min(2, "Product name is required").max(200),
  slug: z
    .string()
    .min(2, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  sku: z.string().max(60).optional().or(z.literal("")),
  modelNumber: z.string().max(60).optional().or(z.literal("")),
  categoryId: z.string().cuid().optional().or(z.literal("")),

  shortDescription: z.string().max(300).optional().or(z.literal("")),
  longDescription: z.string().max(10000).optional().or(z.literal("")),

  material: z.string().max(200).optional().or(z.literal("")),
  application: z.string().max(200).optional().or(z.literal("")),
  color: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  packaging: z.string().max(300).optional().or(z.literal("")),
  moq: z.string().max(100).optional().or(z.literal("")),
  weight: z.string().max(100).optional().or(z.literal("")),

  stockStatus: z
    .enum(["IN_STOCK", "OUT_OF_STOCK", "MADE_TO_ORDER", "DISCONTINUED"])
    .default("IN_STOCK"),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),

  brochurePdf: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),

  specifications: z.array(productSpecificationSchema).default([]),

  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  seoKeywords: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productListQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "name", "updatedAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
