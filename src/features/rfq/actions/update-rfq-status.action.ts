"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { rfqRepository } from "../repositories/rfq.repository";
import { rfqStatusUpdateSchema } from "../schemas/rfq.schema";
import { notificationService } from "@/features/notifications/services/notification.service";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateRfqStatusAction(
  rfqId: string,
  status: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const parsed = rfqStatusUpdateSchema.safeParse({ rfqId, status });
    if (!parsed.success) {
      return { success: false, error: "Invalid status." };
    }

    const rfq = await rfqRepository.updateStatus(rfqId, parsed.data.status);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "Rfq",
      entityId: rfqId,
      metadata: { status: parsed.data.status },
    });

    if (rfq.userId) {
      await notificationService.notifyUser(rfq.userId, {
        type: "RFQ_STATUS_CHANGED",
        title: "Your quotation request was updated",
        body: `RFQ ${rfq.refNo} is now ${parsed.data.status.replaceAll("_", " ").toLowerCase()}.`,
        link: `/dashboard/rfqs/${rfq.id}`,
      });
    }

    revalidatePath("/admin/rfqs");
    revalidatePath(`/admin/rfqs/${rfqId}`);
    revalidatePath(`/dashboard/rfqs/${rfqId}`);

    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateRfqStatusAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
