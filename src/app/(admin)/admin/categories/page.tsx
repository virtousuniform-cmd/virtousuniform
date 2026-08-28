import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { categoryRepository } from "@/features/categories/repositories/category.repository";
import { CategoriesTable } from "@/features/categories/components/categories-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  const categories = await categoryRepository.findAll();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus /> New Category
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No categories yet. Products can&apos;t be organized until you create at least one.
          </p>
        </div>
      ) : (
        <CategoriesTable categories={categories} />
      )}
    </div>
  );
}
