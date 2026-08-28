"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { rfqRepository } from "../repositories/rfq.repository";
import { rfqMessageSchema } from "../schemas/rfq.schema";
import { notificationService } from "@/features/notifications/services/notification.service";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function sendRfqMessageAction(
  rfqId: string,
  message: string,
): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const role = (session.user as { role?: string }).role;
    const isAdmin = !!role && ADMIN_ROLES.includes(role);

    const parsed = rfqMessageSchema.safeParse({ rfqId, message });
    if (!parsed.success) {
      return { success: false, error: "Message cannot be empty." };
    }

    const rfq = await rfqRepository.findById(rfqId);
    if (!rfq) return { success: false, error: "Request for quotation not found." };

    if (!isAdmin && rfq.userId !== session.user.id) {
      throw new UnauthorizedError("You can only message your own requests.");
    }

    await rfqRepository.addMessage(
      rfqId,
      isAdmin ? "ADMIN" : "CUSTOMER",
      session.user.id,
      parsed.data.message,
    );

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "RfqMessage",
      entityId: rfqId,
    });

    if (isAdmin && rfq.userId) {
      await notificationService.notifyUser(rfq.userId, {
        type: "RFQ_MESSAGE",
        title: "New reply on your quotation request",
        body: `Our team replied to RFQ ${rfq.refNo}.`,
        link: `/dashboard/rfqs/${rfq.id}`,
      });
    } else if (!isAdmin) {
      await notificationService.notifyAdmins({
        type: "RFQ_MESSAGE",
        title: "Customer replied to a quotation request",
        body: `${rfq.companyName} replied on RFQ ${rfq.refNo}.`,
        link: `/admin/rfqs/${rfq.id}`,
      });
    }

    revalidatePath(`/admin/rfqs/${rfqId}`);
    revalidatePath(`/dashboard/rfqs/${rfqId}`);

    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("sendRfqMessageAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
