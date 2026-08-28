import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { rfqRepository } from "@/features/rfq/repositories/rfq.repository";
import { RfqStatusSelect } from "@/features/rfq/components/rfq-status-select";
import { RfqConversation } from "@/features/rfq/components/rfq-conversation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Request for Quotation — Admin" };

export default async function AdminRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rfq = await rfqRepository.findById(id);
  if (!rfq) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Submitted {formatDate(rfq.createdAt)}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{rfq.refNo}</h1>
        </div>
        <RfqStatusSelect rfqId={rfq.id} initialStatus={rfq.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
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
                      <div>
                        <p className="font-medium text-foreground">
                          {item.product ? (
                            <Link
                              href={`/admin/products/${item.product.id}`}
                              className="hover:underline"
                            >
                              {item.product.name}
                            </Link>
                          ) : (
                            "Custom item"
                          )}
                        </p>
                        {item.notes && (
                          <p className="text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                      <span className="text-muted-foreground">{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
              {rfq.requirements && (
                <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
                  <p className="mb-1 font-medium text-foreground">Additional requirements</p>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {rfq.requirements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <RfqConversation rfqId={rfq.id} messages={rfq.messages} viewerRole="ADMIN" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="Company" value={rfq.companyName} />
              <InfoRow label="Contact" value={rfq.contactName} />
              <InfoRow label="Email" value={rfq.email} />
              <InfoRow label="Phone" value={rfq.phone} />
              <InfoRow label="Country" value={rfq.country} />
              <InfoRow label="Est. Quantity" value={rfq.quantity} />
              <InfoRow
                label="Preferred Contact"
                value={rfq.preferredContactMethod}
              />
              {rfq.user && (
                <div className="pt-2">
                  <Link
                    href={`/admin/customers/${rfq.user.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View customer account →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {rfq.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {rfq.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm text-primary hover:underline"
                  >
                    {att.fileName}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
