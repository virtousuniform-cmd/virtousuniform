import { prisma } from "@/lib/prisma";

export type FaqItemFormValues = {
  question: string;
  answer: string;
  category?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
};

export const faqRepository = {
  async findAll() {
    return prisma.faqItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  },

  async findVisible() {
    return prisma.faqItem.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  },

  async findById(id: string) {
    return prisma.faqItem.findUnique({ where: { id } });
  },

  async create(data: FaqItemFormValues) {
    return prisma.faqItem.create({ data });
  },

  async update(id: string, data: FaqItemFormValues) {
    return prisma.faqItem.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.faqItem.delete({ where: { id } });
  },
};
