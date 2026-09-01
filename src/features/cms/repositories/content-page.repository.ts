import { prisma } from "@/lib/prisma";
import type { ContentStatus } from "@prisma/client";

export type ContentPageFormValues = {
  title: string;
  slug: string;
  content: string;
  status: ContentStatus;
  featuredImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export const contentPageRepository = {
  async findMany() {
    return prisma.contentPage.findMany({
      orderBy: { updatedAt: "desc" },
    });
  },

  async findBySlug(slug: string) {
    return prisma.contentPage.findUnique({
      where: { slug },
    });
  },

  async findById(id: string) {
    return prisma.contentPage.findUnique({
      where: { id },
    });
  },

  async create(data: ContentPageFormValues) {
    return prisma.contentPage.create({
      data,
    });
  },

  async update(id: string, data: ContentPageFormValues) {
    return prisma.contentPage.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.contentPage.delete({
      where: { id },
    });
  },

  async slugExists(slug: string, excludeId?: string) {
    const existing = await prisma.contentPage.findFirst({
      where: { slug, id: { not: excludeId } },
      select: { id: true },
    });
    return !!existing;
  },
};
