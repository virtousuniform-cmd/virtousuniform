import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  phone: z.string().max(30).optional().or(z.literal("")),
  companyName: z.string().max(200).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
