"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { uploadToStorage } from "@/lib/supabase-admin";
import { productionFacilityRepository } from "../repositories/production-facility.repository";
import {
  productionFacilityFormSchema,
  type ProductionFacilityFormValues,
} from "../schemas/production-facility.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];

export async function uploadProductionFacilityImageAction(
  formData: FormData
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
    const path = `production-facilities/${nanoid(10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await uploadToStorage(path, buffer, file.type);

    return { success: true, data: { url } };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("uploadProductionFacilityImageAction failed", err);
    return { success: false, error: "Upload failed. Please try again." };
  }
}

export async function createProductionFacilityAction(
  input: ProductionFacilityFormValues & { imageUrl: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = productionFacilityFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (!input.imageUrl) {
      return {
        success: false,
        error: "An image is required.",
      };
    }

    const facility = await productionFacilityRepository.create({
      ...parsed.data,
      imageUrl: input.imageUrl,
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "ProductionFacility",
      entityId: facility.id,
      metadata: { title: facility.title },
    });

    revalidatePath("/");
    revalidatePath("/admin/production-facilities");

    return { success: true, data: { id: facility.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("createProductionFacilityAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateProductionFacilityAction(
  id: string,
  input: ProductionFacilityFormValues & { imageUrl?: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = productionFacilityFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existingFacility = await productionFacilityRepository.findById(id);
    if (!existingFacility) {
      return { success: false, error: "Facility not found." };
    }

    const facility = await productionFacilityRepository.update(id, {
      ...parsed.data,
      imageUrl: input.imageUrl || existingFacility.imageUrl,
    });

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "ProductionFacility",
      entityId: facility.id,
      metadata: { title: facility.title },
    });

    revalidatePath("/");
    revalidatePath("/admin/production-facilities");

    return { success: true, data: { id: facility.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("updateProductionFacilityAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteProductionFacilityAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    await productionFacilityRepository.delete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "ProductionFacility",
      entityId: id,
    });

    revalidatePath("/");
    revalidatePath("/admin/production-facilities");

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("deleteProductionFacilityAction failed", err);
    return { success: false, error: "Could not delete facility." };
  }
}

export async function reorderProductionFacilitiesAction(
  facilities: { id: string; displayOrder: number }[]
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    await productionFacilityRepository.reorder(facilities);

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "ProductionFacility",
      metadata: { action: "reorder", count: facilities.length },
    });

    revalidatePath("/");
    revalidatePath("/admin/production-facilities");

    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: err.message };
    }
    console.error("reorderProductionFacilitiesAction failed", err);
    return { success: false, error: "Could not reorder facilities." };
  }
}
