import Link from "next/link";
import type { Metadata } from "next";
import { cn, formatDate } from "@/lib/utils";
import { contactRepository } from "@/features/contact/repositories/contact.repository";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AdminPagination } from "@/components/shared/admin-pagination";

export const metadata: Metadata = { title: "Messages — Admin" };

const PAGE_SIZE = 20;
const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  ARCHIVED: "Archived",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "outline"> = {
  NEW: "default",
  IN_PROGRESS: "secondary",
  RESOLVED: "success",
  ARCHIVED: "outline",
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const status = params.status as "NEW" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED" | undefined;
  const page = Number(params.page ?? 1);

  const { items, total } = await contactRepository.findMany({
    status,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">{total} total messages</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border pb-px">
        <StatusTab label="All" href="/admin/messages" active={!status} />
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <StatusTab
            key={key}
            label={label}
            href={`/admin/messages?status=${key}`}
            active={status === key}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No messages in this view.</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell>
                      <Link
                        href={`/admin/messages/${msg.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {msg.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{msg.email}</p>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{msg.subject}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[msg.status] ?? "outline"}>
                        {STATUS_LABELS[msg.status] ?? msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/messages"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}

function StatusTab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-t-md border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
