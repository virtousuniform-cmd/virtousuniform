"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, UnauthorizedError } from "@/lib/auth-guards";
import { notificationService } from "../services/notification.service";

type ActionResult = { success: true } | { success: false; error: string };

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    await notificationService.markAllAsRead(session.user.id);
    revalidatePath("/dashboard/notifications");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("markAllNotificationsReadAction failed", err);
    return { success: false, error: "Something went wrong." };
  }
}
