import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { rfqRepository } from "@/features/rfq/repositories/rfq.repository";
import { RfqTable } from "@/features/rfq/components/rfq-table";
import { RFQ_STATUS_LABELS } from "@/features/rfq/components/rfq-status-badge";
import { AdminPagination } from "@/components/shared/admin-pagination";

export const metadata: Metadata = { title: "Requests for Quotation — Admin" };

const PAGE_SIZE = 20;

export default async function AdminRfqsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const status = params.status as
    | "NEW"
    | "UNDER_REVIEW"
    | "QUOTED"
    | "NEGOTIATING"
    | "AWAITING_CUSTOMER"
    | "CONFIRMED"
    | "CLOSED"
    | "CANCELLED"
    | undefined;
  const page = Number(params.page ?? 1);

  const { items, total } = await rfqRepository.findMany({
    status,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Requests for Quotation
        </h1>
        <p className="text-sm text-muted-foreground">{total} total requests</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border pb-px">
        <StatusTab label="All" href="/admin/rfqs" active={!status} />
        {Object.entries(RFQ_STATUS_LABELS).map(([key, label]) => (
          <StatusTab
            key={key}
            label={label}
            href={`/admin/rfqs?status=${key}`}
            active={status === key}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No requests in this view.</p>
        </div>
      ) : (
        <>
          <RfqTable rfqs={items} />
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/rfqs"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}

function StatusTab({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
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
