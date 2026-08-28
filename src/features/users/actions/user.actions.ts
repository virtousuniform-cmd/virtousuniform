"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireSuperAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { userRepository } from "../repositories/user.repository";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "CUSTOMER"] as const;

export async function updateUserRoleAction(
  userId: string,
  role: string,
): Promise<ActionResult> {
  try {
    const session = await requireSuperAdmin();

    if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
      return { success: false, error: "Invalid role." };
    }

    if (userId === session.user.id && role !== "SUPER_ADMIN") {
      return { success: false, error: "You can't remove your own super admin access." };
    }

    await userRepository.setRole(userId, role as (typeof VALID_ROLES)[number]);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "User",
      entityId: userId,
      metadata: { role },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateUserRoleAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function toggleUserActiveAction(
  userId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    if (userId === session.user.id && !isActive) {
      return { success: false, error: "You can't deactivate your own account." };
    }

    await userRepository.setActive(userId, isActive);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "User",
      entityId: userId,
      metadata: { isActive },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("toggleUserActiveAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
