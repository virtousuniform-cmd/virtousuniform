import { prisma } from "@/lib/prisma";
import type { BlogCategoryFormValues } from "../schemas/blog.schema";

export const blogCategoryRepository = {
  async findAll() {
    return prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  },

  async slugExists(slug: string, excludeId?: string) {
    const existing = await prisma.blogCategory.findFirst({
      where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    });
    return !!existing;
  },

  async create(data: BlogCategoryFormValues) {
    return prisma.blogCategory.create({ data });
  },

  async delete(id: string) {
    return prisma.blogCategory.delete({ where: { id } });
  },
};
