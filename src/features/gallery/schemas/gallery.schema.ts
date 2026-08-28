import { z } from "zod";

export const galleryAlbumFormSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type GalleryAlbumFormValues = z.infer<typeof galleryAlbumFormSchema>;
