import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { userRepository } from "@/features/users/repositories/user.repository";
import { RfqStatusBadge } from "@/features/rfq/components/rfq-status-badge";
import { ActiveToggle } from "@/features/users/components/active-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Customer — Admin" };

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await userRepository.findCustomerWithActivity(id);
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Customer since {formatDate(customer.createdAt)}</p>
          <h1 className="text-2xl font-semibold text-foreground">{customer.name}</h1>
        </div>
        <ActiveToggle userId={customer.id} isActive={customer.isActive} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent quotation requests ({customer._count.rfqs} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.rfqs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No requests submitted yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {customer.rfqs.map((rfq) => (
                    <li key={rfq.id} className="flex items-center justify-between py-2 text-sm">
                      <Link
                        href={`/admin/rfqs/${rfq.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {rfq.refNo}
                      </Link>
                      <RfqStatusBadge status={rfq.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent messages ({customer._count.contactMessages} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.contactMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contact messages yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {customer.contactMessages.map((msg) => (
                    <li key={msg.id} className="py-2">
                      <Link
                        href={`/admin/messages/${msg.id}`}
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        {msg.subject}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved products ({customer._count.savedProducts} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.savedProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved products.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {customer.savedProducts.map((sp) => (
                    <Link
                      key={sp.id}
                      href={`/products/${sp.product.slug}`}
                      target="_blank"
                      className="rounded-full bg-muted px-3 py-1 text-xs text-foreground hover:bg-muted/70"
                    >
                      {sp.product.name}
                    </Link>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Email" value={customer.email} />
            <InfoRow label="Phone" value={customer.phone ?? "—"} />
            <InfoRow label="Company" value={customer.companyName ?? "—"} />
            <InfoRow label="Country" value={customer.country ?? "—"} />
            <InfoRow
              label="Email verified"
              value={customer.emailVerified ? "Yes" : "No"}
            />
          </CardContent>
        </Card>
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
