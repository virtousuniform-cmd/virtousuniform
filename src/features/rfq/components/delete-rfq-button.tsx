"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteRfqAction } from "../actions/rfq.actions";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function DeleteRfqButton({ rfqId, refNo }: { rfqId: string; refNo: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to permanently delete RFQ ${refNo}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteRfqAction(rfqId);
      if (result.success) {
        toast.success(`RFQ ${refNo} deleted.`);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Failed to delete RFQ.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isDeleting}
      onClick={(e) => {
        e.stopPropagation();
        handleDelete();
      }}
    >
      <Trash2 className="size-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
