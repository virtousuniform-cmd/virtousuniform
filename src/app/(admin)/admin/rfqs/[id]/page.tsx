import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { rfqRepository } from "@/features/rfq/repositories/rfq.repository";
import { RfqStatusSelect } from "@/features/rfq/components/rfq-status-select";
import { RfqConversation } from "@/features/rfq/components/rfq-conversation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Request for Quotation — Admin" };

export default async function AdminRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("Fetching RFQ:", id);
  let rfq;
  try {
    rfq = await rfqRepository.findById(id);
  } catch (err) {
    console.error("Error fetching RFQ:", err);
    throw err;
  }

  if (!rfq) notFound();
  console.log("RFQ fetched successfully:", rfq.refNo);

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
                    <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      {item.product?.images?.[0] ? (
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].altText || item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {item.product ? (
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {item.product.name}
                                </Link>
                              ) : (
                                "Custom item"
                              )}
                            </p>
                            {item.product?.category && (
                              <p className="text-xs text-muted-foreground">
                                Category: {item.product.category.name}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            Qty: {item.quantity}
                          </Badge>
                        </div>

                        {item.product?.specifications && item.product.specifications.length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                            {item.product.specifications.map((spec) => (
                              <p key={spec.id} className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/70">{spec.label}:</span> {spec.value}
                              </p>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <p className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {rfq.requirements && (
                <div className="mt-6 rounded-md bg-muted/50 p-4 text-sm">
                  <p className="mb-2 font-medium text-foreground">Detailed requirements</p>
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
