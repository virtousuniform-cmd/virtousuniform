"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { blogCategoryRepository } from "../repositories/blog-category.repository";
import { blogCategoryFormSchema, type BlogCategoryFormValues } from "../schemas/blog.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createBlogCategoryAction(
  input: BlogCategoryFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = blogCategoryFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await blogCategoryRepository.slugExists(parsed.data.slug)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["This slug is already taken."] },
      };
    }

    const category = await blogCategoryRepository.create(parsed.data);

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "BlogCategory",
      entityId: category.id,
    });

    revalidatePath("/admin/blogs");
    return { success: true, data: { id: category.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("createBlogCategoryAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteBlogCategoryAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await blogCategoryRepository.delete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "BlogCategory",
      entityId: id,
    });

    revalidatePath("/admin/blogs");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteBlogCategoryAction failed", err);
    return { success: false, error: "Could not delete category." };
  }
}
