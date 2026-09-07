"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { uploadToStorage } from "@/lib/supabase";
import {
  settingsRepository,
  type ContactInfoSetting,
  type SocialLinksSetting,
  type SeoDefaultsSetting,
  type CatalogSettings,
  type BrandingSetting,
} from "../repositories/settings.repository";

type ActionResult<T = undefined> =
  | { success: true; data: T }
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
    return { success: true, data: undefined };
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
    return { success: true, data: undefined };
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
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateSeoDefaultsAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateCatalogSettingsAction(value: CatalogSettings): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await settingsRepository.setCatalogSettings(value);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "SiteSetting",
      entityId: "catalog_settings",
    });

    revalidatePath("/", "layout");
    revalidatePath("/products", "layout");
    revalidatePath("/admin/settings");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateCatalogSettingsAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateBrandingAction(value: BrandingSetting): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await settingsRepository.setBranding(value);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "SiteSetting",
      entityId: "branding",
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateBrandingAction failed", err);
    return { success: false, error: "Failed to update branding settings." };
  }
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };

    const ext = file.name.split(".").pop() || "png";
    const path = `site/logo-${nanoid(5)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToStorage(path, buffer, file.type);

    return { success: true, data: { url } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("uploadLogoAction failed", err);
    return { success: false, error: "Upload failed." };
  }
}
