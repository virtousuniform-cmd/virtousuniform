"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { contactRepository } from "../repositories/contact.repository";
import { contactReplySchema, contactStatusUpdateSchema } from "../schemas/contact.schema";
import { notificationService } from "@/features/notifications/services/notification.service";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function replyToContactMessageAction(
  contactMessageId: string,
  message: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const parsed = contactReplySchema.safeParse({ contactMessageId, message });
    if (!parsed.success) {
      return { success: false, error: "Reply cannot be empty." };
    }

    const original = await contactRepository.findById(contactMessageId);
    if (!original) return { success: false, error: "Message not found." };

    await contactRepository.addReply(contactMessageId, session.user.id, parsed.data.message);

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "ContactReply",
      entityId: contactMessageId,
    });

    if (original.userId) {
      await notificationService.notifyUser(original.userId, {
        type: "CONTACT_REPLY",
        title: "You have a new reply",
        body: `Our team replied to your message: "${original.subject}"`,
        link: `/dashboard/messages`,
      });
    }

    revalidatePath("/admin/messages");
    revalidatePath(`/admin/messages/${contactMessageId}`);

    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("replyToContactMessageAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateContactStatusAction(
  contactMessageId: string,
  status: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const parsed = contactStatusUpdateSchema.safeParse({ contactMessageId, status });
    if (!parsed.success) {
      return { success: false, error: "Invalid status." };
    }

    await contactRepository.updateStatus(contactMessageId, parsed.data.status);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "ContactMessage",
      entityId: contactMessageId,
      metadata: { status: parsed.data.status },
    });

    revalidatePath("/admin/messages");
    revalidatePath(`/admin/messages/${contactMessageId}`);

    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateContactStatusAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
