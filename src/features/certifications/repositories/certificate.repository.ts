import { prisma } from "@/lib/prisma";
import type { CertificateFormValues } from "../schemas/certificate.schema";

export const certificateRepository = {
  async findAll() {
    return prisma.certificate.findMany({ orderBy: { sortOrder: "asc" } });
  },

  async create(data: CertificateFormValues & { fileUrl: string; thumbnail?: string }) {
    const count = await prisma.certificate.count();
    return prisma.certificate.create({
      data: {
        title: data.title,
        issuer: data.issuer || null,
        fileUrl: data.fileUrl,
        thumbnail: data.thumbnail || null,
        issuedDate: data.issuedDate ? new Date(data.issuedDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        sortOrder: count,
      },
    });
  },

  async delete(id: string) {
    return prisma.certificate.delete({ where: { id } });
  },
};
