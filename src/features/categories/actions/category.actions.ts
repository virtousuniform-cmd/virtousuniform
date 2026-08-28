"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { categoryRepository } from "../repositories/category.repository";
import { categoryFormSchema, type CategoryFormValues } from "../schemas/category.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createCategoryAction(
  input: CategoryFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = categoryFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await categoryRepository.slugExists(parsed.data.slug)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["This slug is already taken."] },
      };
    }

    const category = await categoryRepository.create(parsed.data);

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Category",
      entityId: category.id,
      metadata: { name: category.name },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true, data: { id: category.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("createCategoryAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateCategoryAction(
  id: string,
  input: CategoryFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = categoryFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await categoryRepository.slugExists(parsed.data.slug, id)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["This slug is already taken."] },
      };
    }

    const category = await categoryRepository.update(id, parsed.data);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Category",
      entityId: category.id,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true, data: { id: category.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateCategoryAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await categoryRepository.softDelete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "Category",
      entityId: id,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteCategoryAction failed", err);
    return { success: false, error: "Could not delete category." };
  }
}
