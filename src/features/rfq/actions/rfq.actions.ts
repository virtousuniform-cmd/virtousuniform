"use server";

import { revalidatePath } from "next/cache";
import { rfqRepository } from "../repositories/rfq.repository";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import type { RfqStatus } from "@prisma/client";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function deleteRfqAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const rfq = await rfqRepository.findById(id);
    if (!rfq) {
      return { success: false, error: "RFQ not found." };
    }

    await rfqRepository.delete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "Rfq",
      entityId: id,
      metadata: { refNo: rfq.refNo },
    });

    revalidatePath("/admin/rfqs");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("deleteRfqAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateRfqStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    await rfqRepository.updateStatus(id, status as RfqStatus);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "Rfq",
      entityId: id,
      metadata: { status },
    });

    revalidatePath("/admin/rfqs");
    revalidatePath(`/admin/rfqs/${id}`);

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("updateRfqStatusAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
