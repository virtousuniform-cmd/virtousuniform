import { z } from "zod";

export const certificateFormSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  issuer: z.string().max(200).optional().or(z.literal("")),
  issuedDate: z.string().optional().or(z.literal("")),
  expiryDate: z.string().optional().or(z.literal("")),
});

export type CertificateFormValues = z.infer<typeof certificateFormSchema>;
