import Link from "next/link";
import type { Metadata } from "next";
import { auditLogRepository } from "@/features/audit-log/repositories/audit-log.repository";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/shared/admin-pagination";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit Logs — Admin" };

const PAGE_SIZE = 30;

const ACTION_VARIANT: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  CREATE: "success",
  UPDATE: "secondary",
  DELETE: "destructive",
  LOGIN: "outline",
  LOGOUT: "outline",
  STATUS_CHANGE: "warning",
  EXPORT: "default",
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const entityType = params.entityType;

  const [{ items, total }, entityTypes] = await Promise.all([
    auditLogRepository.findMany({
      entityType,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    auditLogRepository.distinctEntityTypes(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">{total} recorded events</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border pb-px">
        <FilterTab label="All" href="/admin/audit-logs" active={!entityType} />
        {entityTypes.map((type) => (
          <FilterTab
            key={type}
            label={type}
            href={`/admin/audit-logs?entityType=${type}`}
            active={entityType === type}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={ACTION_VARIANT[log.action] ?? "outline"}>
                        {log.action.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{log.entityType}</span>
                      {log.entityId && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          {log.entityId.slice(0, 8)}…
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.user ? `${log.user.name} (${log.user.email})` : "System"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(log.createdAt, { hour: "numeric", minute: "numeric" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/audit-logs"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}

function FilterTab({ label, href, active }: { label: string; href: string; active: boolean }) {
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
