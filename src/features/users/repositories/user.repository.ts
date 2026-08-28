import { prisma } from "@/lib/prisma";
import type { Role, Prisma } from "@prisma/client";

const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

export const userRepository = {
  /** Admin/editor staff accounts — shown on /admin/users. */
  async findStaff() {
    return prisma.user.findMany({
      where: { role: { in: STAFF_ROLES } },
      orderBy: { createdAt: "asc" },
    });
  },

  /** Customer accounts — shown on /admin/customers. */
  async findCustomers(params: { search?: string; skip?: number; take?: number }) {
    const where: Prisma.UserWhereInput = {
      role: "CUSTOMER",
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } },
          { companyName: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  /** Search across all roles — used on /admin/users to find an existing
   * account (e.g. a customer) to promote to a staff role. */
  async searchAll(query: string) {
    if (!query.trim()) return [];
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { name: "asc" },
    });
  },

  async findCustomerWithActivity(id: string) {
    return prisma.user.findUnique({
      where: { id, role: "CUSTOMER" },
      include: {
        rfqs: { orderBy: { createdAt: "desc" }, take: 10 },
        contactMessages: { orderBy: { createdAt: "desc" }, take: 10 },
        savedProducts: { include: { product: { select: { name: true, slug: true } } } },
        _count: { select: { rfqs: true, contactMessages: true, savedProducts: true } },
      },
    });
  },

  async setRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  },

  async setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  },

  async countCustomers() {
    return prisma.user.count({ where: { role: "CUSTOMER" } });
  },
};
