"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteContactMessageAction } from "../actions/contact.actions";

export function DeleteMessageButton({
  messageId,
  subject,
  redirectTo
}: {
  messageId: string;
  subject: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`This will permanently delete the message "${subject}". This cannot be undone. Proceed?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteContactMessageAction(messageId);
      if (result.success) {
        toast.success("Message deleted.");
        if (redirectTo) {
          router.push(redirectTo);
        }
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Failed to delete message.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      disabled={isDeleting}
      onClick={(e) => {
        e.stopPropagation();
        handleDelete();
      }}
    >
      <Trash2 className="size-4" />
      <span className="sr-only">Delete message</span>
    </Button>
  );
}
