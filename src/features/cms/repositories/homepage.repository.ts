import { prisma } from "@/lib/prisma";
import type { HomepageSectionKey } from "@prisma/client";

export const homepageRepository = {
  async findVisibleOrdered() {
    return prisma.homepageSection.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    });
  },

  async findAll() {
    return prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  },

  async findByKey(key: HomepageSectionKey) {
    return prisma.homepageSection.findUnique({ where: { key } });
  },

  async upsertContent(key: HomepageSectionKey, content: object) {
    return prisma.homepageSection.upsert({
      where: { key },
      update: { content },
      create: { key, content },
    });
  },

  async setVisibility(key: HomepageSectionKey, isVisible: boolean) {
    return prisma.homepageSection.update({ where: { key }, data: { isVisible } });
  },
};
