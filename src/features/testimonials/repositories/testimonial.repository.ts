import { prisma } from "@/lib/prisma";

export const testimonialRepository = {
  async findAll() {
    return prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  },

  async findById(id: string) {
    return prisma.testimonial.findUnique({ where: { id } });
  },

  async create(data: {
    customerName: string;
    companyName?: string;
    country?: string;
    rating: number;
    review: string;
    isApproved: boolean;
    isFeatured: boolean;
  }) {
    return prisma.testimonial.create({ data });
  },

  async setApproval(id: string, isApproved: boolean, approvedById?: string) {
    return prisma.testimonial.update({
      where: { id },
      data: { isApproved, approvedById: isApproved ? approvedById : null },
    });
  },

  async setFeatured(id: string, isFeatured: boolean) {
    return prisma.testimonial.update({ where: { id }, data: { isFeatured } });
  },

  async delete(id: string) {
    return prisma.testimonial.delete({ where: { id } });
  },

  async countPending() {
    return prisma.testimonial.count({ where: { isApproved: false } });
  },
};
