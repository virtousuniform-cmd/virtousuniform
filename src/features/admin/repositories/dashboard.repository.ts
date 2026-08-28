import { prisma } from "@/lib/prisma";

export const dashboardRepository = {
  async getOverviewStats() {
    const [
      totalProducts,
      publishedProducts,
      totalCategories,
      totalRfqs,
      openRfqs,
      totalCustomers,
      unreadContactMessages,
      pendingTestimonials,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.category.count({ where: { deletedAt: null } }),
      prisma.rfq.count(),
      prisma.rfq.count({
        where: { status: { notIn: ["CLOSED", "CANCELLED", "CONFIRMED"] } },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.testimonial.count({ where: { isApproved: false } }),
    ]);

    return {
      totalProducts,
      publishedProducts,
      totalCategories,
      totalRfqs,
      openRfqs,
      totalCustomers,
      unreadContactMessages,
      pendingTestimonials,
    };
  },

  /** RFQ volume for the last N days, bucketed by day — feeds the overview chart. */
  async getRfqTrend(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rfqs = await prisma.rfq.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const rfq of rfqs) {
      const key = rfq.createdAt.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
  },

  async getRfqStatusBreakdown() {
    const grouped = await prisma.rfq.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    return grouped.map((g) => ({ status: g.status, count: g._count._all }));
  },

  async getRecentRfqs(take = 5) {
    return prisma.rfq.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        refNo: true,
        companyName: true,
        status: true,
        createdAt: true,
      },
    });
  },
};
