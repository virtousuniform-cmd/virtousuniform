import { NextRequest, NextResponse } from "next/server";
import { rfqRepository } from "@/features/rfq/repositories/rfq.repository";
import { requireAdmin } from "@/lib/auth-guards";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const rfq = await rfqRepository.findById(id);

    if (!rfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    return NextResponse.json(rfq);
  } catch (error) {
    console.error("API RFQ data fetch failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
