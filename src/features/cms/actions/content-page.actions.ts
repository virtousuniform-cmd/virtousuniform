"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { contentPageRepository, type ContentPageFormValues } from "../repositories/content-page.repository";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createContentPageAction(
  data: ContentPageFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    if (await contentPageRepository.slugExists(data.slug)) {
      return { success: false, error: "Slug already exists." };
    }

    const page = await contentPageRepository.create(data);

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "ContentPage",
      entityId: page.id,
      metadata: { title: page.title },
    });

    revalidatePath("/admin/cms");
    revalidatePath(`/${page.slug}`);

    return { success: true, data: { id: page.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("createContentPageAction", err);
    return { success: false, error: "Failed to create page." };
  }
}

export async function updateContentPageAction(
  id: string,
  data: ContentPageFormValues,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    if (await contentPageRepository.slugExists(data.slug, id)) {
      return { success: false, error: "Slug already exists." };
    }

    await contentPageRepository.update(id, data);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "ContentPage",
      entityId: id,
      metadata: { title: data.title },
    });

    revalidatePath("/admin/cms");
    revalidatePath(`/${data.slug}`);

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateContentPageAction", err);
    return { success: false, error: "Failed to update page." };
  }
}

export async function deleteContentPageAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const page = await contentPageRepository.findById(id);
    if (!page) return { success: false, error: "Page not found." };

    await contentPageRepository.delete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "ContentPage",
      entityId: id,
      metadata: { title: page.title },
    });

    revalidatePath("/admin/cms");
    revalidatePath(`/${page.slug}`);

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteContentPageAction", err);
    return { success: false, error: "Failed to delete page." };
  }
}
