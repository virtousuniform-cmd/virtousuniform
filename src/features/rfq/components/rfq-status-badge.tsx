import { Badge } from "@/components/ui/badge";

export const RFQ_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  UNDER_REVIEW: "Under Review",
  QUOTED: "Quoted",
  NEGOTIATING: "Negotiating",
  AWAITING_CUSTOMER: "Awaiting Customer",
  CONFIRMED: "Confirmed",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export const RFQ_STATUS_OPTIONS = Object.keys(RFQ_STATUS_LABELS);

const RFQ_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  NEW: "default",
  UNDER_REVIEW: "secondary",
  QUOTED: "warning",
  NEGOTIATING: "warning",
  AWAITING_CUSTOMER: "secondary",
  CONFIRMED: "success",
  CLOSED: "outline",
  CANCELLED: "destructive",
};

export function RfqStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={RFQ_STATUS_VARIANT[status] ?? "outline"}>
      {RFQ_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
