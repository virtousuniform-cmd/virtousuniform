import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().min(2, "Subject is required").max(200),
  message: z.string().min(10, "Please provide a bit more detail").max(3000),
  // Honeypot field — bots fill it, real users never see it (hidden via CSS).
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactReplySchema = z.object({
  contactMessageId: z.string().cuid(),
  message: z.string().min(1, "Reply cannot be empty").max(3000),
});

export const contactStatusUpdateSchema = z.object({
  contactMessageId: z.string().cuid(),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"]),
});
