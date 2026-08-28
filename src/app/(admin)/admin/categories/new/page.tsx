import type { Metadata } from "next";
import { categoryRepository } from "@/features/categories/repositories/category.repository";
import { CategoryForm } from "@/features/categories/components/category-form";

export const metadata: Metadata = { title: "New Category — Admin" };

export default async function NewCategoryPage() {
  const categories = await categoryRepository.findAll();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New category</h1>
        <p className="text-sm text-muted-foreground">
          Categories organize products in the catalog and public navigation.
        </p>
      </div>
      <CategoryForm categories={categories} />
    </div>
  );
}
