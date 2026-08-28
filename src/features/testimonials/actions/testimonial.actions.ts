"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit, UnauthorizedError } from "@/lib/auth-guards";
import { testimonialRepository } from "../repositories/testimonial.repository";
import { testimonialFormSchema, type TestimonialFormValues } from "../schemas/testimonial.schema";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createTestimonialAction(
  input: TestimonialFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();

    const parsed = testimonialFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const testimonial = await testimonialRepository.create({
      customerName: parsed.data.customerName,
      companyName: parsed.data.companyName || undefined,
      country: parsed.data.country || undefined,
      rating: parsed.data.rating,
      review: parsed.data.review,
      isApproved: parsed.data.isApproved,
      isFeatured: parsed.data.isFeatured,
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Testimonial",
      entityId: testimonial.id,
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
    revalidatePath("/");

    return { success: true, data: { id: testimonial.id } };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("createTestimonialAction failed", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function setTestimonialApprovalAction(
  id: string,
  isApproved: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await testimonialRepository.setApproval(id, isApproved, session.user.id);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "Testimonial",
      entityId: id,
      metadata: { isApproved },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("setTestimonialApprovalAction failed", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function setTestimonialFeaturedAction(
  id: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await testimonialRepository.setFeatured(id, isFeatured);

    await logAudit({
      userId: session.user.id,
      action: "STATUS_CHANGE",
      entityType: "Testimonial",
      entityId: id,
      metadata: { isFeatured },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("setTestimonialFeaturedAction failed", err);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await testimonialRepository.delete(id);

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "Testimonial",
      entityId: id,
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/testimonials");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("deleteTestimonialAction failed", err);
    return { success: false, error: "Could not delete testimonial." };
  }
}
