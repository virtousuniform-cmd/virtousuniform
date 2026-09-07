import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notificationService } from "@/features/notifications/services/notification.service";
import { CustomerSidebar } from "@/features/dashboard/components/customer-sidebar";
import { CustomerHeader } from "@/features/dashboard/components/customer-header";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  const [unreadCount, branding] = await Promise.all([
    notificationService.unreadCount(session.user.id),
    settingsRepository.getBranding(),
  ]);

  return (
    <div className="flex min-h-screen">
      <CustomerSidebar branding={branding} />
      <div className="flex flex-1 flex-col">
        <CustomerHeader
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
          unreadCount={unreadCount}
          branding={branding}
        />
        <main className="flex-1 bg-muted/20">{children}</main>
      </div>
    </div>
  );
}
