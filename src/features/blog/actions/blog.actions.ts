"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { blogRepository } from "../repositories/blog.repository";
import { blogPostFormSchema, type BlogPostFormValues } from "../schemas/blog.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createBlogPostAction(
  input: BlogPostFormValues,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = blogPostFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await blogRepository.slugExists(parsed.data.slug)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["This slug is already taken."] },
      };
    }

    const post = await blogRepository.create(parsed.data, session.user.id);

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "BlogPost",
      entityId: post.id,
      metadata: { title: post.title },
    });

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");

    return { success: true, data: { id: post.id, slug: post.slug } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("createBlogPostAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateBlogPostAction(
  id: string,
  input: BlogPostFormValues,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = blogPostFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await blogRepository.slugExists(parsed.data.slug, id)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["This slug is already taken."] },
      };
    }

    const post = await blogRepository.update(id, parsed.data);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "BlogPost",
      entityId: post.id,
    });

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return { success: true, data: { id: post.id, slug: post.slug } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateBlogPostAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await blogRepository.softDelete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "BlogPost",
      entityId: id,
    });

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteBlogPostAction failed", err);
    return { success: false, error: "Could not delete post." };
  }
}
