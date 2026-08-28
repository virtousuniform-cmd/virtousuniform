import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { auth } from "@/lib/auth";
import { contactRepository } from "@/features/contact/repositories/contact.repository";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { DeleteMessageButton } from "@/features/contact/components/delete-message-button";

export const metadata: Metadata = { title: "Messages" };

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  ARCHIVED: "Archived",
};

export default async function CustomerMessagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const messages = await contactRepository.findByUser(session!.user.id);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Your contact form submissions and our team&apos;s replies.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <MessageSquare className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No messages yet.</p>
          <Link href="/contact" className="text-sm text-primary hover:underline">
            Contact us →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">{msg.subject}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{STATUS_LABELS[msg.status] ?? msg.status}</Badge>
                  <DeleteMessageButton messageId={msg.id} subject={msg.subject} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="whitespace-pre-line text-sm text-foreground">{msg.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sent {formatDate(msg.createdAt)}
                  </p>
                </div>
                {msg.replies.map((reply) => (
                  <div key={reply.id} className="rounded-md bg-muted/50 p-3 text-sm">
                    <p className="whitespace-pre-line text-foreground">{reply.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Our team · {formatDate(reply.createdAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
