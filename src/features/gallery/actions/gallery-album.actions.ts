"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { galleryRepository } from "../repositories/gallery.repository";
import { galleryAlbumFormSchema, type GalleryAlbumFormValues } from "../schemas/gallery.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createGalleryAlbumAction(
  input: GalleryAlbumFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = galleryAlbumFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await galleryRepository.slugExists(parsed.data.slug)) {
      return {
        success: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["This slug is already taken."] },
      };
    }

    const album = await galleryRepository.createAlbum(parsed.data);

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "GalleryAlbum",
      entityId: album.id,
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true, data: { id: album.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("createGalleryAlbumAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteGalleryAlbumAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await galleryRepository.deleteAlbum(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "GalleryAlbum",
      entityId: id,
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteGalleryAlbumAction failed", err);
    return { success: false, error: "Could not delete album." };
  }
}
