import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notificationService } from "@/features/notifications/services/notification.service";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminHeader } from "@/features/admin/components/admin-header";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  const role = (session.user as { role?: string }).role;
  if (!role || !ADMIN_ROLES.includes(role)) {
    redirect("/dashboard");
  }

  const unreadCount = await notificationService.unreadCount(session.user.id);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
          unreadCount={unreadCount}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
