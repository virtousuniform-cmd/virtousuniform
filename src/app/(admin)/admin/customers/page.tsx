import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { userRepository } from "@/features/users/repositories/user.repository";
import { ActiveToggle } from "@/features/users/components/active-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/shared/admin-pagination";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers — Admin" };

const PAGE_SIZE = 20;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await userRepository.findCustomers({
    search: params.search,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">{total} registered customers</p>
      </div>

      <form className="flex max-w-sm items-center gap-2" action="/admin/customers">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={params.search}
            placeholder="Search by name, email, company…"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No customers found.</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {customer.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.companyName ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.country ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <ActiveToggle userId={customer.id} isActive={customer.isActive} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/customers"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
