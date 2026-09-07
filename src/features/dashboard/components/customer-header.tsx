"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { BrandLogo } from "@/components/layout/brand-logo";
import type { BrandingSetting } from "@/features/settings/repositories/settings.repository";

export function CustomerHeader({
  user,
  unreadCount,
  branding,
}: {
  user: { name: string; email: string; image?: string | null };
  unreadCount: number;
  branding?: BrandingSetting;
}) {
  const router = useRouter();
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground uppercase tracking-tight">
          <BrandLogo className="h-7 w-16" logoUrl={branding?.logoUrl} />
        </Link>
      </div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="/dashboard/notifications" aria-label="Notifications">
            <Bell />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Link>
        </Button>

        <Avatar>
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
