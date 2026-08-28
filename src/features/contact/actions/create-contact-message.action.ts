"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { contactRepository } from "../repositories/contact.repository";
import { contactFormSchema, type ContactFormValues } from "../schemas/contact.schema";
import { sendContactAutoReply } from "@/lib/resend";
import { notificationService } from "@/features/notifications/services/notification.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createContactMessageAction(
  input: ContactFormValues,
): Promise<ActionResult> {
  // Honeypot: real users never populate this hidden field.
  if (input.website) {
    return { success: true }; // pretend success, drop silently
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const { success: withinLimit } = await checkRateLimit(`contact:${ip}`);
  if (!withinLimit) {
    return {
      success: false,
      error: "Too many messages submitted recently. Please try again in a few minutes.",
    };
  }

  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const session = await auth.api.getSession({ headers: headersList });

  const message = await contactRepository.create({
    ...parsed.data,
    userId: session?.user.id,
  });

  await Promise.allSettled([
    sendContactAutoReply(message.email),
    notificationService.notifyAdmins({
      type: "CONTACT_MESSAGE",
      title: "New contact message",
      body: `${message.name} sent a message: "${message.subject}"`,
      link: `/admin/messages/${message.id}`,
    }),
  ]);

  revalidatePath("/admin/messages");
  return { success: true };
}
