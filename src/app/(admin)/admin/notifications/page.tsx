import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { notificationService } from "@/features/notifications/services/notification.service";
import { NotificationList } from "@/features/notifications/components/notification-list";

export const metadata: Metadata = { title: "Notifications — Admin" };

export default async function AdminNotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const notifications = await notificationService.findByUser(session!.user.id);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          New RFQs, contact messages, and system activity.
        </p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
