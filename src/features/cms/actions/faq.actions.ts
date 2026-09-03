"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { faqRepository, type FaqItemFormValues } from "../repositories/faq.repository";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createFaqAction(data: FaqItemFormValues): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();
    const faq = await faqRepository.create(data);

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "FaqItem",
      entityId: faq.id,
    });

    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    revalidatePath("/");

    return { success: true, data: { id: faq.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    return { success: false, error: "Failed to create FAQ." };
  }
}

export async function updateFaqAction(id: string, data: FaqItemFormValues): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await faqRepository.update(id, data);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "FaqItem",
      entityId: id,
    });

    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    revalidatePath("/");

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    return { success: false, error: "Failed to update FAQ." };
  }
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await faqRepository.delete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "FaqItem",
      entityId: id,
    });

    revalidatePath("/admin/faq");
    revalidatePath("/faq");
    revalidatePath("/");

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    return { success: false, error: "Failed to delete FAQ." };
  }
}
