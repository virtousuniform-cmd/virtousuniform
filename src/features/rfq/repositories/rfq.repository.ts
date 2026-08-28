import { prisma } from "@/lib/prisma";
import type { Prisma, RfqStatus } from "@prisma/client";
import type { RfqFormValues } from "../schemas/rfq.schema";

/**
 * Data-access layer for RFQs. Keeps Prisma calls out of Server Actions /
 * services so persistence details can change without touching business logic.
 */
export const rfqRepository = {
  async create(data: RfqFormValues & { refNo: string; userId?: string }) {
    return prisma.rfq.create({
      data: {
        refNo: data.refNo,
        userId: data.userId,
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        quantity: data.quantity,
        requirements: data.requirements,
        preferredContactMethod: data.preferredContactMethod,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });
  },

  async findById(id: string) {
    return prisma.rfq.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        attachments: true,
        messages: { orderBy: { createdAt: "asc" } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async findMany(params: {
    status?: RfqStatus;
    userId?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.RfqWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.userId && { userId: params.userId }),
    };

    const [items, total] = await Promise.all([
      prisma.rfq.findMany({
        where,
        include: { items: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.rfq.count({ where }),
    ]);

    return { items, total };
  },

  async updateStatus(id: string, status: RfqStatus) {
    return prisma.rfq.update({
      where: { id },
      data: { status, closedAt: status === "CLOSED" ? new Date() : undefined },
    });
  },

  async countAll() {
    return prisma.rfq.count();
  },

  async addMessage(rfqId: string, senderType: "CUSTOMER" | "ADMIN", senderId: string | undefined, message: string) {
    return prisma.rfqMessage.create({
      data: { rfqId, senderType, senderId, message },
    });
  },
};
