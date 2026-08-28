import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryRepository } from "@/features/categories/repositories/category.repository";
import { CategoryForm } from "@/features/categories/components/category-form";

export const metadata: Metadata = { title: "Edit Category — Admin" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    categoryRepository.findById(id),
    categoryRepository.findAll(),
  ]);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{category.name}</h1>
        <p className="text-sm text-muted-foreground">/{category.slug}</p>
      </div>
      <CategoryForm
        categoryId={category.id}
        categories={categories}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          parentId: category.parentId ?? "",
          isVisible: category.isVisible,
          sortOrder: category.sortOrder,
        }}
      />
    </div>
  );
}
