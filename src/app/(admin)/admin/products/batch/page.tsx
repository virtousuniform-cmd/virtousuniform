import type { Metadata } from "next";
import { categoryRepository } from "@/features/categories/repositories/category.repository";
import { BatchUploadForm } from "@/features/products/components/batch-upload-form";

export const metadata: Metadata = { title: "Batch Product Upload — Admin" };

export default async function BatchProductPage() {
  const categories = await categoryRepository.findVisible();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Batch Product Generation</h1>
        <p className="text-sm text-muted-foreground">
          Streamline your catalog expansion. Upload multiple product images and let our system auto-generate the professional listings.
        </p>
      </div>

      <BatchUploadForm categories={categories} />
    </div>
  );
}
