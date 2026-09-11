import { z } from "zod";

export const productionFacilityFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional().nullable(),
  imageAlt: z.string().max(200).optional().nullable(),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export type ProductionFacilityFormValues = z.infer<typeof productionFacilityFormSchema>;
