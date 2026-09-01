"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteContentPageAction } from "../actions/content-page.actions";

export function DeletePageButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete the page "${title}"?`)) return;

    startTransition(async () => {
      const result = await deleteContentPageAction(id);
      if (result.success) {
        toast.success("Page deleted.");
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
