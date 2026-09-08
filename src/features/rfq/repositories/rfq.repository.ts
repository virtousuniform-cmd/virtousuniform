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
            productId: item.productId || null,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });
  },

  async findById(id: string) {
    if (!id) return null;

    const include = {
      items: {
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
              images: {
                orderBy: { sortOrder: "asc" as const },
                take: 1,
                select: { url: true, altText: true }
              },
              specifications: {
                orderBy: { sortOrder: "asc" as const },
                take: 5,
                select: { id: true, label: true, value: true }
              },
            },
          },
        },
      },
      attachments: { select: { id: true, fileUrl: true, fileName: true } },
      messages: {
        orderBy: { createdAt: "asc" as const },
        select: { id: true, message: true, senderType: true, createdAt: true }
      },
      user: { select: { id: true, name: true, email: true } },
    };

    try {
      // 1. Try finding by ID if it looks like a CUID (starts with 'c')
      if (id.length >= 20 && id.startsWith("c")) {
        const rfq = await prisma.rfq.findUnique({
          where: { id },
          include,
        });
        if (rfq) return rfq;
      }

      // 2. Try finding by refNo if it looks like an RFQ number (starts with 'RFQ')
      if (id.startsWith("RFQ")) {
        const rfq = await prisma.rfq.findUnique({
          where: { refNo: id },
          include,
        });
        if (rfq) return rfq;
      }

      // 3. Last ditch: check both (slightly slower)
      // Only run if the above specific checks didn't return anything
      return await prisma.rfq.findFirst({
        where: {
          OR: [
            { id: id.length >= 20 ? id : undefined },
            { refNo: id }
          ].filter(Boolean) as Prisma.RfqWhereInput[],
        },
        include,
      });
    } catch (error) {
      console.error("Critical error in rfqRepository.findById:", error);
      return null;
    }
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

  async delete(id: string) {
    return prisma.rfq.delete({
      where: { id },
    });
  },

  async addMessage(rfqId: string, senderType: "CUSTOMER" | "ADMIN", senderId: string | undefined, message: string) {
    return prisma.rfqMessage.create({
      data: { rfqId, senderType, senderId, message },
    });
  },
};
