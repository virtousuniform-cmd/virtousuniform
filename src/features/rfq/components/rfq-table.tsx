import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RfqStatusBadge } from "./rfq-status-badge";
import { formatDate } from "@/lib/utils";
import { DeleteRfqButton } from "./delete-rfq-button";
import { RfqPdfButton } from "./rfq-pdf-button";

type RfqRow = {
  id: string;
  refNo: string;
  companyName: string;
  contactName: string;
  country: string;
  status: string;
  createdAt: Date | string;
  user: { name: string; email: string } | null;
};

export function RfqTable({ rfqs }: { rfqs: RfqRow[] }) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rfqs.map((rfq) => (
            <TableRow key={rfq.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/admin/rfqs/${rfq.id}`} className="hover:underline">
                  {rfq.refNo}
                </Link>
              </TableCell>
              <TableCell>{rfq.companyName}</TableCell>
              <TableCell className="text-muted-foreground">{rfq.contactName}</TableCell>
              <TableCell className="text-muted-foreground">{rfq.country}</TableCell>
              <TableCell>
                <RfqStatusBadge status={rfq.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(rfq.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <RfqPdfButton
                    rfqId={rfq.id}
                    refNo={rfq.refNo}
                    customerName={rfq.contactName}
                  />
                  <DeleteRfqButton rfqId={rfq.id} refNo={rfq.refNo} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
