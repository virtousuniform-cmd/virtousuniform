"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
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
import { deleteCategoryAction } from "../actions/category.actions";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  isVisible: boolean;
  parentId: string | null;
  parent: { name: string } | null;
  _count: { products: number };
};

export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const [rows, setRows] = useState(categories);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string, productCount: number) {
    const message =
      productCount > 0
        ? `"${name}" has ${productCount} product${productCount === 1 ? "" : "s"} assigned. Delete anyway? Those products will become uncategorized.`
        : `Delete "${name}"?`;
    if (!confirm(message)) return;

    setDeletingId(id);
    startTransition(async () => {
      try {
        const result = await deleteCategoryAction(id);
        if (result.success) {
          toast.success("Category deleted.");
          setRows((prev) => prev.filter((c) => c.id !== id));
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Couldn't reach the server. Try again.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="text-center">Visible</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/admin/categories/${cat.id}`} className="hover:underline">
                  {cat.name}
                </Link>
                <p className="text-xs text-muted-foreground">/{cat.slug}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {cat.parent?.name ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">{cat._count.products}</TableCell>
              <TableCell className="text-center">
                <Badge variant={cat.isVisible ? "success" : "outline"}>
                  {cat.isVisible ? "Visible" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/categories/${cat.id}`} aria-label="Edit category">
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                    disabled={isPending && deletingId === cat.id}
                    aria-label="Delete category"
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
