"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { uploadToStorage } from "@/lib/supabase";
import { certificateRepository } from "../repositories/certificate.repository";
import { certificateFormSchema } from "../schemas/certificate.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/webp", "image/jpeg", "image/png"];

export async function uploadCertificateAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = certificateFormSchema.safeParse({
      title: formData.get("title"),
      issuer: formData.get("issuer") ?? "",
      issuedDate: formData.get("issuedDate") ?? "",
      expiryDate: formData.get("expiryDate") ?? "",
    });
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "A certificate file is required." };
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: "Only PDF, WEBP, JPEG, or PNG files are allowed." };
    }
    if (file.size > MAX_FILE_BYTES) {
      return { success: false, error: "File must be smaller than 10MB." };
    }

    const ext = file.type.split("/")[1];
    const path = `certificates/${nanoid(10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadToStorage(path, buffer, file.type);

    const certificate = await certificateRepository.create({
      ...parsed.data,
      fileUrl,
      thumbnail: file.type.startsWith("image/") ? fileUrl : undefined,
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Certificate",
      entityId: certificate.id,
    });

    revalidatePath("/admin/certificates");
    revalidatePath("/certifications");

    return { success: true, data: { id: certificate.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("uploadCertificateAction failed", err);
    return { success: false, error: "Upload failed. Please try again." };
  }
}

export async function deleteCertificateAction(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await requireAdmin();
    await certificateRepository.delete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "Certificate",
      entityId: id,
    });

    revalidatePath("/admin/certificates");
    revalidatePath("/certifications");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteCertificateAction failed", err);
    return { success: false, error: "Could not delete certificate." };
  }
}
