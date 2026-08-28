import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { rfqRepository } from "@/features/rfq/repositories/rfq.repository";
import { RfqStatusBadge } from "@/features/rfq/components/rfq-status-badge";
import { RfqConversation } from "@/features/rfq/components/rfq-conversation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Quotation Request" };

export default async function CustomerRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const rfq = await rfqRepository.findById(id);

  if (!rfq) notFound();
  if (rfq.userId !== session!.user.id) redirect("/dashboard/rfqs");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Submitted {formatDate(rfq.createdAt)}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{rfq.refNo}</h1>
        </div>
        <RfqStatusBadge status={rfq.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requested products</CardTitle>
        </CardHeader>
        <CardContent>
          {rfq.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No specific products selected — see requirements below.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {rfq.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium text-foreground">
                    {item.product?.name ?? "Custom item"}
                  </span>
                  <span className="text-muted-foreground">{item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
          {rfq.requirements && (
            <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
              <p className="mb-1 font-medium text-foreground">Additional requirements</p>
              <p className="whitespace-pre-line text-muted-foreground">{rfq.requirements}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <RfqConversation rfqId={rfq.id} messages={rfq.messages} viewerRole="CUSTOMER" />
        </CardContent>
      </Card>
    </div>
  );
}
