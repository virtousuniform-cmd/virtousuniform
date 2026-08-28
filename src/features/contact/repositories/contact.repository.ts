import { prisma } from "@/lib/prisma";
import type { Prisma, ContactStatus } from "@prisma/client";
import type { ContactFormValues } from "../schemas/contact.schema";

export const contactRepository = {
  async create(data: ContactFormValues & { userId?: string }) {
    return prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        userId: data.userId,
      },
    });
  },

  async findMany(params: { status?: ContactStatus; skip?: number; take?: number }) {
    const where: Prisma.ContactMessageWhereInput = {
      ...(params.status && { status: params.status }),
    };

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.contactMessage.findUnique({
      where: { id },
      include: {
        replies: { orderBy: { createdAt: "asc" }, include: { admin: { select: { name: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async updateStatus(id: string, status: ContactStatus) {
    return prisma.contactMessage.update({ where: { id }, data: { status } });
  },

  async addReply(contactMessageId: string, adminId: string, message: string) {
    await prisma.contactMessage.update({
      where: { id: contactMessageId },
      data: { status: "IN_PROGRESS" },
    });
    return prisma.contactReply.create({
      data: { contactMessageId, adminId, message },
    });
  },

  async countNew() {
    return prisma.contactMessage.count({ where: { status: "NEW" } });
  },

  async findByUser(userId: string) {
    return prisma.contactMessage.findMany({
      where: { userId },
      include: { replies: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async delete(id: string) {
    return prisma.contactMessage.delete({ where: { id } });
  },
};
