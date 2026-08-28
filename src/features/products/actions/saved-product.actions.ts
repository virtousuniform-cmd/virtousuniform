"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, UnauthorizedError } from "@/lib/auth-guards";
import { savedProductRepository } from "../repositories/saved-product.repository";

type ActionResult =
  | { success: true; saved: boolean }
  | { success: false; error: string; requiresAuth?: boolean };

export async function toggleSavedProductAction(productId: string): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const result = await savedProductRepository.toggle(session.user.id, productId);

    revalidatePath("/dashboard/saved-products");
    return { success: true, saved: result.saved };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { success: false, error: "Sign in to save products.", requiresAuth: true };
    }
    console.error("toggleSavedProductAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
