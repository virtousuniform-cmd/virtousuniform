import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
};

export const notificationService = {
  /** Notify a single user. */
  async notifyUser(userId: string, input: CreateNotificationInput) {
    return prisma.notification.create({
      data: { userId, ...input },
    });
  },

  /** Notify every admin-role user (SUPER_ADMIN, ADMIN, EDITOR). */
  async notifyAdmins(input: CreateNotificationInput) {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "EDITOR"] }, isActive: true },
      select: { id: true },
    });

    if (admins.length === 0) return;

    return prisma.notification.createMany({
      data: admins.map((admin) => ({ userId: admin.id, ...input })),
    });
  },

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  async findByUser(userId: string, take = 30) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async clearAll(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  },
};
