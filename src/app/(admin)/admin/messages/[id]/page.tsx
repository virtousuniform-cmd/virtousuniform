import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { contactRepository } from "@/features/contact/repositories/contact.repository";
import { ContactReplyForm } from "@/features/contact/components/contact-reply-form";
import { ContactStatusSelect } from "@/features/contact/components/contact-status-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Message — Admin" };

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await contactRepository.findById(id);
  if (!message) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            From {message.name} · {message.email} · {formatDate(message.createdAt)}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{message.subject}</h1>
        </div>
        <ContactStatusSelect contactMessageId={message.id} initialStatus={message.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Original message</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm text-foreground">{message.message}</p>
          {message.phone && (
            <p className="mt-3 text-sm text-muted-foreground">Phone: {message.phone}</p>
          )}
        </CardContent>
      </Card>

      {message.replies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reply history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {message.replies.map((reply) => (
              <div key={reply.id} className="rounded-md bg-muted/50 p-3 text-sm">
                <p className="whitespace-pre-line text-foreground">{reply.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {reply.admin?.name ?? "Admin"} · {formatDate(reply.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactReplyForm contactMessageId={message.id} />
        </CardContent>
      </Card>
    </div>
  );
}
