"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notificationService } from "../services/notification.service";
import { UnauthorizedError } from "@/lib/auth-guards";

export async function clearAllNotificationsAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new UnauthorizedError("You must be signed in.");

    await notificationService.clearAll(session.user.id);
    revalidatePath("/dashboard/notifications");
    revalidatePath("/admin/notifications");

    return { success: true };
  } catch (err) {
    console.error("clearAllNotificationsAction failed", err);
    return { success: false, error: "Failed to clear notifications." };
  }
}

export async function markAsReadAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new UnauthorizedError("You must be signed in.");

    await notificationService.markAsRead(id);
    revalidatePath("/dashboard/notifications");
    revalidatePath("/admin/notifications");

    return { success: true };
  } catch (err) {
    console.error("markAsReadAction failed", err);
    return { success: false, error: "Failed to mark as read." };
  }
}
