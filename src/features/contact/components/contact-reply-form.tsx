"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replyToContactMessageAction } from "../actions/admin-contact.actions";

export function ContactReplyForm({ contactMessageId }: { contactMessageId: string }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    startTransition(async () => {
      const result = await replyToContactMessageAction(contactMessageId, message);
      if (result.success) {
        toast.success("Reply sent.");
        setMessage("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a reply…"
        rows={4}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !message.trim()}>
          <Send /> Send reply
        </Button>
      </div>
    </form>
  );
}
