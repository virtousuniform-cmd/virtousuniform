"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { homepageRepository } from "../repositories/homepage.repository";
import type { HomepageSectionKey } from "@prisma/client";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateSectionContentAction(
  key: HomepageSectionKey,
  content: object,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await homepageRepository.upsertContent(key, content);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "HomepageSection",
      entityId: key,
    });

    revalidatePath("/admin/cms");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateSectionContentAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function toggleSectionVisibilityAction(
  key: HomepageSectionKey,
  isVisible: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await homepageRepository.setVisibility(key, isVisible);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "HomepageSection",
      entityId: key,
      metadata: { isVisible },
    });

    revalidatePath("/admin/cms");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("toggleSectionVisibilityAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
