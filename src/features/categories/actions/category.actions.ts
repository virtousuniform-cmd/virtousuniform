"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { uploadToStorage } from "@/lib/supabase";
import { categoryRepository } from "../repositories/category.repository";
import { categoryFormSchema, type CategoryFormValues } from "../schemas/category.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB for category thumb
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];

export async function uploadCategoryImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  try {
    await requireAdmin();

    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: "Only WEBP, JPEG, or PNG images are allowed." };
    }
    if (file.size > MAX_FILE_BYTES) {
      return { success: false, error: "Image must be smaller than 2MB." };
    }

    const ext = file.type.split("/")[1];
    const path = `categories/${nanoid(10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await uploadToStorage(path, buffer, file.type);

    return { success: true, data: { url } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("uploadCategoryImageAction failed", err);
    return { success: false, error: "Upload failed." };
  }
}

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

    revalidatePath("/");
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

    revalidatePath("/");
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

    revalidatePath("/");
    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteCategoryAction failed", err);
    return { success: false, error: "Could not delete category." };
  }
}
