"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCheck, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { markAllNotificationsReadAction } from "../actions/mark-read.action";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date | string;
};

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  const [items, setItems] = useState(notifications);
  const [isPending, startTransition] = useTransition();
  const unreadCount = items.filter((n) => !n.isRead).length;

  function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.success) toast.error(result.error);
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
        <Bell className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            <CheckCheck /> Mark all as read
          </Button>
        </div>
      )}

      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {items.map((n) => {
          const content = (
            <div
              className={cn(
                "flex items-start gap-3 px-4 py-3",
                !n.isRead && "bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n.isRead ? "bg-transparent" : "bg-primary",
                )}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(n.createdAt, { hour: "numeric", minute: "numeric" })}
                </p>
              </div>
            </div>
          );

          return n.link ? (
            <Link key={n.id} href={n.link} className="block hover:bg-muted/50">
              {content}
            </Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
