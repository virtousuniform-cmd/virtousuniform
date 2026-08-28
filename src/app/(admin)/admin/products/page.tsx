import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Search } from "lucide-react";
import { productRepository } from "@/features/products/repositories/product.repository";
import { productListQuerySchema } from "@/features/products/schemas/product.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductsTable } from "@/features/products/components/products-table";
import { AdminPagination } from "@/components/shared/admin-pagination";

export const metadata: Metadata = { title: "Products — Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = productListQuerySchema.parse({
    search: params.search,
    categoryId: params.categoryId,
    status: params.status,
    page: params.page,
    pageSize: params.pageSize,
  });

  const { items, total, page, pageSize } = await productRepository.findMany(query);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">
            {total} product{total === 1 ? "" : "s"} total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> New Product
          </Link>
        </Button>
      </div>

      <form className="flex max-w-sm items-center gap-2" action="/admin/products">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={query.search}
            placeholder="Search by name or SKU…"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {query.search
              ? "No products match your search."
              : "No products yet. Create your first product to get started."}
          </p>
        </div>
      ) : (
        <>
          <ProductsTable products={items} />
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/products"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
