import type { Metadata } from "next";
import { categoryRepository } from "@/features/categories/repositories/category.repository";
import { ProductForm } from "@/features/products/components/product-form";

export const metadata: Metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  const categories = await categoryRepository.findAll();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New product</h1>
        <p className="text-sm text-muted-foreground">
          Fields left blank can be completed later — save as Draft anytime.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
