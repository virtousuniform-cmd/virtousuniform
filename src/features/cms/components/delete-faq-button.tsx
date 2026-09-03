"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteFaqAction } from "../actions/faq.actions";

export function DeleteFaqButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    if (!confirm("Permanently delete this FAQ?")) return;

    startTransition(async () => {
      const result = await deleteFaqAction(id);
      if (result.success) {
        toast.success("FAQ deleted.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
