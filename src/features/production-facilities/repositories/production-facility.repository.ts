import { prisma } from "@/lib/prisma";

export const productionFacilityRepository = {
  async create(data: {
    title: string;
    description?: string | null;
    imageUrl: string;
    imageAlt?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    return prisma.productionFacility.create({
      data: {
        ...data,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  },

  async update(id: string, data: Partial<{
    title: string;
    description: string | null;
    imageUrl: string;
    imageAlt: string | null;
    displayOrder: number;
    isActive: boolean;
  }>) {
    return prisma.productionFacility.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.productionFacility.delete({
      where: { id },
    });
  },

  async findAll() {
    return prisma.productionFacility.findMany({
      orderBy: { displayOrder: "asc" },
    });
  },

  async findActive() {
    return prisma.productionFacility.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.productionFacility.findUnique({
      where: { id },
    });
  },

  async reorder(facilities: { id: string; displayOrder: number }[]) {
    const updatePromises = facilities.map((f) =>
      prisma.productionFacility.update({
        where: { id: f.id },
        data: { displayOrder: f.displayOrder },
      })
    );
    return Promise.all(updatePromises);
  },
};
