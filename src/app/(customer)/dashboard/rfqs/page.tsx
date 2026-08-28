import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { rfqRepository } from "@/features/rfq/repositories/rfq.repository";
import { RfqStatusBadge } from "@/features/rfq/components/rfq-status-badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Quotation Requests" };

export default async function CustomerRfqsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const { items } = await rfqRepository.findMany({ userId: session!.user.id, take: 100 });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Quotation Requests</h1>
        <p className="text-sm text-muted-foreground">{items.length} total requests</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <FileText className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No quotation requests yet.</p>
          <Link href="/request-quote" className="text-sm text-primary hover:underline">
            Request a quotation →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {items.map((rfq) => (
            <Link
              key={rfq.id}
              href={`/dashboard/rfqs/${rfq.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium text-foreground">{rfq.refNo}</p>
                <p className="text-sm text-muted-foreground">
                  Submitted {formatDate(rfq.createdAt)}
                </p>
              </div>
              <RfqStatusBadge status={rfq.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
