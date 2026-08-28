"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { uploadToStorage } from "@/lib/supabase";
import { galleryRepository } from "../repositories/gallery.repository";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB (video-friendly)
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png", "video/mp4", "video/webm"];

export async function uploadGalleryMediaAction(
  albumId: string,
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  try {
    await requireAdmin();

    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: "Unsupported file type." };
    }
    if (file.size > MAX_FILE_BYTES) {
      return { success: false, error: "File must be smaller than 15MB." };
    }

    const isVideo = file.type.startsWith("video/");
    const ext = file.type.split("/")[1];
    const path = `gallery/${albumId}/${nanoid(10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await uploadToStorage(path, buffer, file.type);
    await galleryRepository.addMedia(albumId, url, isVideo ? "VIDEO" : "IMAGE");

    revalidatePath(`/admin/gallery`);
    revalidatePath("/gallery");
    return { success: true, data: { url } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("uploadGalleryMediaAction failed", err);
    return { success: false, error: "Upload failed. Please try again." };
  }
}

export async function removeGalleryMediaAction(mediaId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await galleryRepository.removeMedia(mediaId);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "GalleryMedia",
      entityId: mediaId,
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("removeGalleryMediaAction failed", err);
    return { success: false, error: "Could not remove media." };
  }
}
