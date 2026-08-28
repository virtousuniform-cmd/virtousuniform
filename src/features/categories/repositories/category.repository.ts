import { prisma } from "@/lib/prisma";
import type { CategoryFormValues } from "../schemas/category.schema";

export const categoryRepository = {
  async findAll() {
    return prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } }, parent: { select: { name: true } } },
    });
  },

  async findVisible() {
    return prisma.category.findMany({
      where: { deletedAt: null, isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async findTree() {
    const all = await this.findAll();
    const byParent = new Map<string | null, typeof all>();
    for (const cat of all) {
      const key = cat.parentId ?? null;
      byParent.set(key, [...(byParent.get(key) ?? []), cat]);
    }
    return byParent;
  },

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  async slugExists(slug: string, excludeId?: string) {
    const existing = await prisma.category.findFirst({
      where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    });
    return !!existing;
  },

  async create(data: CategoryFormValues) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId || null,
        isVisible: data.isVisible,
        sortOrder: data.sortOrder,
      },
    });
  },

  async update(id: string, data: CategoryFormValues) {
    return prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parentId: data.parentId || null,
        isVisible: data.isVisible,
        sortOrder: data.sortOrder,
      },
    });
  },

  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isVisible: false },
    });
  },
};
