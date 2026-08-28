"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { contactRepository } from "../repositories/contact.repository";
import { UnauthorizedError, logAudit } from "@/lib/auth-guards";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteContactMessageAction(id: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new UnauthorizedError("You must be signed in.");

    const message = await contactRepository.findById(id);
    if (!message) return { success: false, error: "Message not found." };

    const isAdmin = ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(session.user.role);
    const isOwner = message.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      throw new UnauthorizedError("You do not have permission to delete this message.");
    }

    await contactRepository.delete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "ContactMessage",
      entityId: id,
      metadata: { subject: message.subject },
    });

    revalidatePath("/admin/messages");
    revalidatePath("/dashboard/messages");

    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteContactMessageAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
