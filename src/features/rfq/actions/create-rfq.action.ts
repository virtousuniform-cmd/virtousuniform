"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
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
  // Honeypot: real users never populate this hidden field (see the
  // "website" field added to rfqFormSchema — mirrors the contact form's
  // existing protection since this is an equally public, unauthenticated
  // endpoint reachable by direct POST).
  if (input.website) {
    return { success: true, refNo: "RFQ-0000-000000" }; // pretend success, drop silently
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const { success: withinLimit } = await checkRateLimit(`rfq:${ip}`);
  if (!withinLimit) {
    return {
      success: false,
      error: "Too many requests submitted recently. Please try again in a few minutes.",
    };
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

  const sequence = (await rfqRepository.countAll()) + 1;
  const refNo = generateRfqRefNo(sequence);

  const rfq = await rfqRepository.create({
    ...parsed.data,
    refNo,
    userId: session?.user.id,
  });

  // Fire-and-forget side effects — never block the customer's success state on these.
  await Promise.allSettled([
    sendRfqReceivedEmail(rfq.email, rfq.refNo),
    notifyAdminNewRfq(rfq.refNo, rfq.companyName),
    notificationService.notifyAdmins({
      type: "RFQ_CREATED",
      title: "New quotation request",
      body: `${rfq.companyName} submitted RFQ ${rfq.refNo}.`,
      link: `/admin/rfqs/${rfq.id}`,
    }),
  ]);

  revalidatePath("/admin/rfqs");
  return { success: true, refNo: rfq.refNo };
}
