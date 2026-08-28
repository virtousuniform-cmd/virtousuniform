import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RfqStatusBadge } from "./rfq-status-badge";
import { formatDate } from "@/lib/utils";

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {rfqs.map((rfq) => (
            <TableRow key={rfq.id} className="cursor-pointer">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
