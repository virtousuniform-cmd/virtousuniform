"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rfqFormSchema, type RfqFormValues } from "../schemas/rfq.schema";
import { rfqRepository } from "../repositories/rfq.repository";
import { generateRfqRefNo } from "@/lib/utils";
import { sendRfqReceivedEmail, notifyAdminNewRfq } from "@/lib/resend";
import { notificationService } from "@/features/notifications/services/notification.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type ActionResult =
  | { success: true; refNo: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createRfqAction(input: RfqFormValues): Promise<ActionResult> {
  try {
    // Honeypot: real users never populate this hidden field
    if (input.website) {
      console.warn("Honeypot triggered in createRfqAction");
      return { success: true, refNo: "RFQ-0000-000000" };
    }

    const headersList = await headers();
    const ip = getClientIp(headersList);

    try {
      const { success: withinLimit } = await checkRateLimit(`rfq:${ip}`);
      if (!withinLimit) {
        return {
          success: false,
          error: "Too many requests submitted recently. Please try again in a few minutes.",
        };
      }
    } catch (rlError) {
      console.error("Rate limit check failed (non-blocking):", rlError);
      // Continue even if rate limit check fails to avoid blocking legitimate users
    }

    const parsed = rfqFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const session = await auth.api.getSession({ headers: headersList });

    // Database operations inside a try block
    let rfq;
    try {
      // Use a more resilient sequence count (handle empty case)
      const rfqCount = await prisma.rfq.count().catch(() => 0);
      const refNo = generateRfqRefNo(rfqCount + 1);

      // Filter and clean items before saving
      const itemsToCreate = (parsed.data.items || [])
        .filter(item => item.quantity && item.quantity.trim() !== "")
        .map(item => ({
          productId: (item.productId && item.productId.trim() !== "") ? item.productId : null,
          quantity: item.quantity,
          notes: item.notes || null,
        }));

      rfq = await prisma.rfq.create({
        data: {
          refNo,
          userId: session?.user?.id || null,
          companyName: parsed.data.companyName,
          contactName: parsed.data.contactName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          country: parsed.data.country,
          quantity: parsed.data.quantity,
          requirements: parsed.data.requirements || null,
          preferredContactMethod: parsed.data.preferredContactMethod,
          items: {
            create: itemsToCreate,
          },
        },
      });
    } catch (dbError: any) {
      console.error("Database error during RFQ creation:", dbError);
      return {
        success: false,
        error: `System Error: ${dbError.message || "Failed to save request"}. Please check your internet and try again.`
      };
    }

    // Fire-and-forget side effects with individual error catching to prevent one failure from breaking the response
    const sideEffects = [
      sendRfqReceivedEmail(rfq.email, rfq.refNo).catch(e => console.error("Email send failed:", e)),
      notifyAdminNewRfq(rfq.refNo, rfq.companyName).catch(e => console.error("Admin notification failed:", e)),
      notificationService.notifyAdmins({
        type: "RFQ_CREATED",
        title: "New quotation request",
        body: `${rfq.companyName} submitted RFQ ${rfq.refNo}.`,
        link: `/admin/rfqs/${rfq.id}`,
      }).catch(e => console.error("In-app notification failed:", e)),
    ];

    // We don't await these to keep the response fast, but we wrap them in a race/timeout if we wanted to be sure.
    // For now, just letting them run in background is fine as they are all caught.

    revalidatePath("/admin/rfqs");
    return { success: true, refNo: rfq.refNo };
  } catch (err: any) {
    console.error("Critical error in createRfqAction:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again or contact support if the issue persists."
    };
  }
}
