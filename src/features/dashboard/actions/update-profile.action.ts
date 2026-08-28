"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, UnauthorizedError } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { profileFormSchema, type ProfileFormValues } from "../schemas/profile.schema";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateProfileAction(input: ProfileFormValues): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = profileFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        companyName: parsed.data.companyName || null,
        country: parsed.data.country || null,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("updateProfileAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
