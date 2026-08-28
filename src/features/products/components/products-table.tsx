"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Star, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteProductAction,
  toggleFeaturedAction,
} from "@/features/products/actions/product.actions";
import { cn } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: string;
  stockStatus: string;
  isFeatured: boolean;
  category: { name: string } | null;
  images: { url: string; altText: string | null }[];
};

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "outline"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  SCHEDULED: "warning",
  ARCHIVED: "outline",
};

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const [rows, setRows] = useState(products);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleToggleFeatured(id: string, next: boolean) {
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, isFeatured: next } : p)));
    startTransition(async () => {
      const result = await toggleFeaturedAction(id, next);
      if (!result.success) {
        toast.error(result.error);
        setRows((prev) => prev.map((p) => (p.id === id ? { ...p, isFeatured: !next } : p)));
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone from the UI.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.success) {
        toast.success("Product deleted.");
        setRows((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(result.error);
      }
      setDeletingId(null);
    });
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-center">Featured</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                  {product.images[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].altText ?? product.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                <Link href={`/admin/products/${product.id}`} className="hover:underline">
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{product.sku ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {product.category?.name ?? "Uncategorized"}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[product.status] ?? "outline"}>
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {product.stockStatus.replaceAll("_", " ")}
              </TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => handleToggleFeatured(product.id, !product.isFeatured)}
                  disabled={isPending}
                  aria-label={product.isFeatured ? "Unfeature product" : "Feature product"}
                  className="inline-flex"
                >
                  <Star
                    className={cn(
                      "size-4",
                      product.isFeatured
                        ? "fill-warning text-warning"
                        : "text-muted-foreground",
                    )}
                  />
                </button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/products/${product.id}`} aria-label="Edit product">
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                    aria-label="Delete product"
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
