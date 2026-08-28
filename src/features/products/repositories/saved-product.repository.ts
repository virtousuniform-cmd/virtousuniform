import { prisma } from "@/lib/prisma";

export const savedProductRepository = {
  async isSaved(userId: string, productId: string) {
    const existing = await prisma.savedProduct.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!existing;
  },

  async toggle(userId: string, productId: string) {
    const existing = await prisma.savedProduct.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.savedProduct.delete({ where: { id: existing.id } });
      return { saved: false };
    }

    await prisma.savedProduct.create({ data: { userId, productId } });
    return { saved: true };
  },

  async findByUser(userId: string) {
    return prisma.savedProduct.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async countByUser(userId: string) {
    return prisma.savedProduct.count({ where: { userId } });
  },
};
