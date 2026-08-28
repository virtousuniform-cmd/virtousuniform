"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import {
  settingsRepository,
  type ContactInfoSetting,
  type SocialLinksSetting,
  type SeoDefaultsSetting,
} from "../repositories/settings.repository";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateContactInfoAction(value: ContactInfoSetting): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await settingsRepository.setContactInfo(value);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "SiteSetting",
      entityId: "contact_info",
    });

    revalidatePath("/", "layout");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateContactInfoAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateSocialLinksAction(value: SocialLinksSetting): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await settingsRepository.setSocialLinks(value);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "SiteSetting",
      entityId: "social_links",
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateSocialLinksAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateSeoDefaultsAction(value: SeoDefaultsSetting): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await settingsRepository.setSeoDefaults(value);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "SiteSetting",
      entityId: "seo_defaults",
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/seo");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateSeoDefaultsAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
