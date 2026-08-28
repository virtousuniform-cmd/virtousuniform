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
import { updateRfqStatusAction } from "../actions/update-rfq-status.action";
import { RFQ_STATUS_LABELS, RFQ_STATUS_OPTIONS } from "./rfq-status-badge";

export function RfqStatusSelect({
  rfqId,
  initialStatus,
}: {
  rfqId: string;
  initialStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string) {
    startTransition(async () => {
      const result = await updateRfqStatusAction(rfqId, status);
      if (result.success) {
        toast.success(`Status updated to ${RFQ_STATUS_LABELS[status]}.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Select defaultValue={initialStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RFQ_STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {RFQ_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
