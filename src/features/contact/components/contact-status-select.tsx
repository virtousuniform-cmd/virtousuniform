"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updateContactStatusAction } from "../actions/admin-contact.actions";

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  ARCHIVED: "Archived",
};

export function ContactStatusSelect({
  contactMessageId,
  initialStatus,
}: {
  contactMessageId: string;
  initialStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string) {
    startTransition(async () => {
      const result = await updateContactStatusAction(contactMessageId, status);
      if (result.success) {
        toast.success(`Marked as ${STATUS_LABELS[status]}.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Select defaultValue={initialStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
