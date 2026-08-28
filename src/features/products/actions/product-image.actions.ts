"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { uploadToStorage } from "@/lib/supabase";
import { productRepository } from "../repositories/product.repository";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];

export async function uploadProductImageAction(
  productId: string,
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
      return { success: false, error: "Image must be smaller than 5MB." };
    }

    const ext = file.type.split("/")[1];
    const path = `products/${productId}/${nanoid(10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await uploadToStorage(path, buffer, file.type);
    await productRepository.addImages(productId, [{ url }]);

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, data: { url } };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("uploadProductImageAction failed", err);
    return { success: false, error: "Upload failed. Please try again." };
  }
}

export async function removeProductImageAction(
  imageId: string,
  productId: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await productRepository.removeImage(imageId);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "ProductImage",
      entityId: imageId,
    });

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("removeProductImageAction failed", err);
    return { success: false, error: "Could not remove image." };
  }
}
