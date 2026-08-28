import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { Heart, FileText, MessageSquare, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savedProductRepository } from "@/features/products/repositories/saved-product.repository";
import { rfqRepository } from "@/features/rfq/repositories/rfq.repository";
import { RfqStatusBadge } from "@/features/rfq/components/rfq-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const [savedCount, { items: recentRfqs, total: rfqTotal }, unresolvedMessages] =
    await Promise.all([
      savedProductRepository.countByUser(userId),
      rfqRepository.findMany({ userId, take: 5 }),
      prisma.contactMessage.count({ where: { userId, status: { not: "RESOLVED" } } }),
    ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {session!.user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Heart}
          label="Saved Products"
          value={savedCount}
          href="/dashboard/saved-products"
        />
        <SummaryCard
          icon={FileText}
          label="Quotation Requests"
          value={rfqTotal}
          href="/dashboard/rfqs"
        />
        <SummaryCard
          icon={MessageSquare}
          label="Open Messages"
          value={unresolvedMessages}
          href="/dashboard/messages"
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent quotation requests</CardTitle>
          <Link
            href="/dashboard/rfqs"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentRfqs.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t submitted any quotation requests yet.
              </p>
              <Link
                href="/request-quote"
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                Request a quotation →
              </Link>
            </div>
          ) : (
            recentRfqs.map((rfq) => (
              <Link
                key={rfq.id}
                href={`/dashboard/rfqs/${rfq.id}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{rfq.refNo}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(rfq.createdAt)}</p>
                </div>
                <RfqStatusBadge status={rfq.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
