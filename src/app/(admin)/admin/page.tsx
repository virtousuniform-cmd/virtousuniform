import Link from "next/link";
import type { Metadata } from "next";
import { Package, FileText, FolderTree, Users, ArrowRight } from "lucide-react";
import { dashboardRepository } from "@/features/admin/repositories/dashboard.repository";
import { StatCard } from "@/features/admin/components/stat-card";
import { RfqTrendChart } from "@/features/admin/components/rfq-trend-chart";
import { RfqStatusBadge } from "@/features/rfq/components/rfq-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview — Admin" };

export default async function AdminOverviewPage() {
  const [stats, trend, recentRfqs] = await Promise.all([
    dashboardRepository.getOverviewStats(),
    dashboardRepository.getRfqTrend(30),
    dashboardRepository.getRecentRfqs(5),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of catalog, sales, and customer activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published Products"
          value={`${stats.publishedProducts} / ${stats.totalProducts}`}
          icon={Package}
        />
        <StatCard label="Categories" value={stats.totalCategories} icon={FolderTree} />
        <StatCard
          label="Open RFQs"
          value={stats.openRfqs}
          icon={FileText}
          tone={stats.openRfqs > 0 ? "warning" : "default"}
        />
        <StatCard label="Customers" value={stats.totalCustomers} icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Quotation requests — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <RfqTrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent RFQs</CardTitle>
            <Link
              href="/admin/rfqs"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRfqs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              recentRfqs.map((rfq) => (
                <Link
                  key={rfq.id}
                  href={`/admin/rfqs/${rfq.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{rfq.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {rfq.refNo} · {formatDate(rfq.createdAt)}
                    </p>
                  </div>
                  <RfqStatusBadge status={rfq.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {(stats.unreadContactMessages > 0 || stats.pendingTestimonials > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.unreadContactMessages > 0 && (
            <Link
              href="/admin/messages"
              className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm"
            >
              <span className="text-foreground">
                {stats.unreadContactMessages} unread contact message
                {stats.unreadContactMessages === 1 ? "" : "s"}
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          )}
          {stats.pendingTestimonials > 0 && (
            <Link
              href="/admin/testimonials"
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
            >
              <span className="text-foreground">
                {stats.pendingTestimonials} testimonial
                {stats.pendingTestimonials === 1 ? "" : "s"} awaiting approval
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
