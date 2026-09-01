import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { productRepository } from "@/features/products/repositories/product.repository";
import { categoryRepository } from "@/features/categories/repositories/category.repository";
import { productListQuerySchema } from "@/features/products/schemas/product.schema";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/shared/admin-pagination";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { cn } from "@/lib/utils";
import { DownloadCatalogueButton } from "@/features/products/components/download-catalogue-button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse our full catalog of ISO-certified industrial, medical, and protective gloves manufactured for global export.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = productListQuerySchema.parse({
    search: params.search,
    categoryId: params.categoryId,
    page: params.page,
  });

  const [{ items, total, page, pageSize }, categories] = await Promise.all([
    productRepository.findPublished(query),
    categoryRepository.findVisible(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      {/* Charcoal page header — matches header/footer, gives every
          non-homepage page the same premium anchor point. */}
      <div className="bg-primary py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand uppercase">Catalog</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
              Find the Right Glove for the Job
            </h1>
            <p className="mt-3 max-w-2xl text-primary-foreground/70">
              Precision-engineered gloves for industrial, medical, and specialty applications —
              manufactured to international quality standards.
            </p>
          </div>
          <div className="shrink-0">
            <DownloadCatalogueButton />
          </div>
        </div>
      </div>

      {/* Quick industry/category filter — the "glove finder" pattern real
          PPE brands use so a buyer can jump straight to their use case
          instead of scanning an unfiltered grid. Pure server-rendered
          links (query params), no client JS needed. */}
      <div className="border-b border-border bg-card py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <FilterPill href="/products" active={!query.categoryId} label="All Products" />
              {categories.map((c) => (
                <FilterPill
                  key={c.id}
                  href={`/products?categoryId=${c.id}`}
                  active={query.categoryId === c.id}
                  label={c.name}
                />
              ))}
            </div>

            <form action="/products" className="relative w-full max-w-sm">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={query.search}
                placeholder="Search products..."
                className="pl-9"
              />
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-24 text-center">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <RevealGroup className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((product) => (
              <RevealItem key={product.id}>
                <TiltCard maxTilt={5} className="rounded-xl">
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] bg-muted">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText ?? product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                      {product.isFeatured && (
                        <Badge variant="brand" className="absolute top-3 left-3">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1.5 p-4">
                      {product.category && (
                        <p className="text-xs font-medium text-brand uppercase">
                          {product.category.name}
                        </p>
                      )}
                      <h3 className="font-medium text-foreground group-hover:text-brand">
                        {product.name}
                      </h3>
                      {product.shortDescription && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {product.shortDescription}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.protectionLevel && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                            {product.protectionLevel}
                          </span>
                        )}
                        {product.material && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                            {product.material}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto border-t border-border p-4 pt-0">
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-xs font-semibold text-brand uppercase tracking-wider">
                          View Specs
                        </span>
                        <div className="size-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                          <Search className="size-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        <div className="mt-10">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/products"
            searchParams={params}
          />
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
