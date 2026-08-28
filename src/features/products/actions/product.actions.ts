"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { productRepository } from "../repositories/product.repository";
import { productFormSchema, type ProductFormValues } from "../schemas/product.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createProductAction(
  input: ProductFormValues,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = productFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await productRepository.slugExists(parsed.data.slug)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["This slug is already taken."] },
      };
    }

    if (parsed.data.sku && (await productRepository.skuExists(parsed.data.sku))) {
      return {
        success: false,
        error: "That SKU is already in use.",
        fieldErrors: { sku: ["This SKU is already assigned to another product."] },
      };
    }

    const product = await productRepository.create(parsed.data);

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Product",
      entityId: product.id,
      metadata: { name: product.name },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, data: { id: product.id, slug: product.slug } };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("createProductAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateProductAction(
  id: string,
  input: ProductFormValues,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = productFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await productRepository.slugExists(parsed.data.slug, id)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["This slug is already taken."] },
      };
    }

    if (parsed.data.sku && (await productRepository.skuExists(parsed.data.sku, id))) {
      return {
        success: false,
        error: "That SKU is already in use.",
        fieldErrors: { sku: ["This SKU is already assigned to another product."] },
      };
    }

    const product = await productRepository.update(id, parsed.data);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Product",
      entityId: product.id,
      metadata: { name: product.name },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return { success: true, data: { id: product.id, slug: product.slug } };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("updateProductAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    await productRepository.softDelete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "Product",
      entityId: id,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("deleteProductAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function toggleFeaturedAction(
  id: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const product = await productRepository.setFeatured(id, isFeatured);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "Product",
      entityId: id,
      metadata: { isFeatured },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("toggleFeaturedAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
