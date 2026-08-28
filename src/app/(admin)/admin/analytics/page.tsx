import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Package, FileText, Newspaper, Star, ImageIcon, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { dashboardRepository } from "@/features/admin/repositories/dashboard.repository";
import { RfqTrendChart } from "@/features/admin/components/rfq-trend-chart";
import { StatCard } from "@/features/admin/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Analytics — Admin" };

export default async function AdminAnalyticsPage() {
  const [trend, statusBreakdown, productCount, publishedPosts, approvedTestimonials, galleryMedia, certificates] =
    await Promise.all([
      dashboardRepository.getRfqTrend(30),
      dashboardRepository.getRfqStatusBreakdown(),
      prisma.product.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.testimonial.count({ where: { isApproved: true } }),
      prisma.galleryMedia.count(),
      prisma.certificate.count(),
    ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Content and sales activity from your own data. For visitor traffic, page views, and
          device breakdowns, see Vercel Analytics below — that's a separate, dedicated tool
          for real traffic data rather than something worth re-building here.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Visitor traffic & Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Page views, top pages, referrers, and Core Web Vitals are tracked automatically by
            Vercel Analytics and Speed Insights (already wired into every page) once this
            project is deployed to Vercel.
          </p>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Open Vercel Analytics <ExternalLink className="size-3.5" />
          </a>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Published Products" value={productCount} icon={Package} />
        <StatCard label="Published Blog Posts" value={publishedPosts} icon={Newspaper} />
        <StatCard label="Approved Testimonials" value={approvedTestimonials} icon={Star} />
        <StatCard label="Gallery Media" value={galleryMedia} icon={ImageIcon} />
        <StatCard label="Certificates" value={certificates} icon={Award} />
      </div>

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
          <CardTitle>RFQ pipeline breakdown</CardTitle>
          <Link href="/admin/rfqs" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {statusBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statusBreakdown.map((s) => (
                <div key={s.status} className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xl font-semibold text-foreground">{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.status.replaceAll("_", " ")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-border p-4">
        <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          This page intentionally doesn&apos;t show fabricated visitor counts or conversion
          rates — those require a real analytics/tracking integration, which is Vercel
          Analytics here. Everything above is queried live from your own database.
        </p>
      </div>
    </div>
  );
}
