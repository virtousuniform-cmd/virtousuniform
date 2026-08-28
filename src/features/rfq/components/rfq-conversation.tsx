"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import { sendRfqMessageAction } from "../actions/rfq-message.action";

type Message = {
  id: string;
  senderType: "CUSTOMER" | "ADMIN";
  message: string;
  createdAt: Date | string;
};

export function RfqConversation({
  rfqId,
  messages,
  viewerRole,
}: {
  rfqId: string;
  messages: Message[];
  /** Which side of the conversation the current viewer is on — controls bubble alignment. */
  viewerRole: "ADMIN" | "CUSTOMER";
}) {
  const [items, setItems] = useState(messages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      senderType: viewerRole,
      message: draft,
      createdAt: new Date(),
    };
    setItems((prev) => [...prev, optimisticMessage]);
    const messageToSend = draft;
    setDraft("");

    startTransition(async () => {
      const result = await sendRfqMessageAction(rfqId, messageToSend);
      if (!result.success) {
        toast.error(result.error);
        setItems((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4">
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation below.
          </p>
        )}
        {items.map((msg) => {
          const isOwn = msg.senderType === viewerRole;
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground border border-border",
                )}
              >
                {msg.message}
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {msg.senderType === "ADMIN" ? "Our Team" : "Customer"} ·{" "}
                {formatDate(msg.createdAt, { hour: "numeric", minute: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a reply…"
          rows={2}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <Button type="submit" disabled={isPending || !draft.trim()} className="self-end">
          <Send />
        </Button>
      </form>
    </div>
  );
}
