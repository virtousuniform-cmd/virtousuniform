import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name is required").max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional().or(z.literal("")),
  parentId: z.string().cuid().optional().or(z.literal("")),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  isFeaturedOnHome: z.boolean().default(false),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
