import { prisma } from "@/lib/prisma";
import type { Prisma, AuditAction } from "@prisma/client";

export const auditLogRepository = {
  async findMany(params: {
    action?: AuditAction;
    entityType?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      ...(params.action && { action: params.action }),
      ...(params.entityType && { entityType: params.entityType }),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  },

  async distinctEntityTypes() {
    const rows = await prisma.auditLog.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    });
    return rows.map((r) => r.entityType);
  },
};
