import { z } from "zod";

export const rfqItemSchema = z.object({
  productId: z.string().cuid().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  notes: z.string().max(500).optional(),
});

export const rfqFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required").max(200),
  contactName: z.string().min(2, "Contact name is required").max(200),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(6, "Enter a valid phone number").max(30),
  country: z.string().min(2, "Country is required"),
  quantity: z.string().min(1, "Estimated quantity is required"),
  requirements: z.string().max(2000).optional(),
  preferredContactMethod: z.enum(["EMAIL", "PHONE", "WHATSAPP"]).default("EMAIL"),
  items: z.array(rfqItemSchema).min(1, "Select at least one product"),
  // Honeypot field — bots fill it, real users never see it (hidden via CSS).
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type RfqFormValues = z.infer<typeof rfqFormSchema>;

export const rfqMessageSchema = z.object({
  rfqId: z.string().cuid(),
  message: z.string().min(1, "Message cannot be empty").max(5000),
});

export const rfqStatusUpdateSchema = z.object({
  rfqId: z.string().cuid(),
  status: z.enum([
    "NEW",
    "UNDER_REVIEW",
    "QUOTED",
    "NEGOTIATING",
    "AWAITING_CUSTOMER",
    "CONFIRMED",
    "CLOSED",
    "CANCELLED",
  ]),
});
