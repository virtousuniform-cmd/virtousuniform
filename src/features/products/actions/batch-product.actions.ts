"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { uploadToStorage } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Processes a single product in a batch.
 * It uploads the image, generates professional metadata, and saves the product.
 */
export async function processSingleBatchProductAction(
  formData: FormData,
  categoryId: string,
  categoryName: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };

    // 1. Upload Image
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/batch/${nanoid(10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadToStorage(path, buffer, file.type);

    // 2. Generate Professional Data from Filename
    // e.g. "blue-nitrile-examination.png" -> "Blue Nitrile Examination"
    const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const name = rawName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    let slug = slugify(name);
    const slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${nanoid(5)}`;

    const shortDescription = `Premium ${name} designed for professional ${categoryName.toLowerCase()} applications. High-performance material ensures safety and comfort.`;
    const longDescription = `Our ${name} is engineered to meet the highest standards of the ${categoryName.toLowerCase()} industry. \n\nKey features include:\n- Superior ergonomic fit\n- Enhanced grip technology\n- Breathable material for extended use\n- Rigorous quality testing for maximum protection.`;

    // 3. Create Product with Intelligent Defaults
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        shortDescription,
        longDescription,
        status: "PUBLISHED",
        stockStatus: "IN_STOCK",
        isFeatured: false,
        material: inferMaterial(name, categoryName),
        protectionLevel: "Professional Grade",
        applications: [categoryName, "Industrial", "General Safety"],
        features: ["Enhanced Grip", "Ergonomic Design", "Breathable Material"],
        images: {
          create: {
            url: imageUrl,
            isPrimary: true,
            sortOrder: 0,
          }
        },
        specifications: {
          create: [
            { label: "Standard", value: "Factory Certified", sortOrder: 0 },
            { label: "Durability", value: "High", sortOrder: 1 }
          ]
        }
      } as any
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Product",
      entityId: product.id,
      metadata: { name: product.name, batch: true },
    });

    return { success: true, data: { id: product.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("processSingleBatchProductAction failed", err);
    return { success: false, error: "Failed to process product." };
  }
}

function inferMaterial(name: string, category: string): string {
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  if (n.includes("nitrile") || c.includes("nitrile")) return "100% Synthetic Nitrile";
  if (n.includes("latex") || c.includes("latex")) return "Natural Rubber Latex";
  if (n.includes("vinyl") || c.includes("vinyl")) return "Polyvinyl Chloride (PVC)";
  if (n.includes("leather")) return "Premium Cowhide Leather";
  return "High-Performance Composite";
}

export async function finishBatchAction() {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}
