import { z } from "zod";

export const testimonialFormSchema = z.object({
  customerName: z.string().min(2, "Customer name is required").max(200),
  companyName: z.string().max(200).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  review: z.string().min(10, "Review is required").max(1000),
  isApproved: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;
