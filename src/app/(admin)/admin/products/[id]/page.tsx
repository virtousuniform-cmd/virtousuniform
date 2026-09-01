import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryRepository } from "@/features/categories/repositories/category.repository";
import { productRepository } from "@/features/products/repositories/product.repository";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductImageManager } from "@/features/products/components/product-image-manager";

export const metadata: Metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    productRepository.findById(id),
    categoryRepository.findAll(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
        <p className="text-sm text-muted-foreground">/products/{product.slug}</p>
      </div>

      <ProductImageManager productId={product.id} images={product.images} />

      <ProductForm
        productId={product.id}
        categories={categories}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          sku: product.sku ?? "",
          modelNumber: product.modelNumber ?? "",
          categoryId: product.categoryId ?? "",
          shortDescription: product.shortDescription ?? "",
          longDescription: product.longDescription ?? "",
          material: product.material ?? "",
          coating: product.coating ?? "",
          protectionLevel: product.protectionLevel ?? "",
          applications: (product as any).applications,
          features: product.features,
          colors: (product as any).colors,
          sizes: product.sizes,
          packaging: product.packaging ?? "",
          moq: product.moq ?? "",
          weight: product.weight ?? "",
          stockStatus: product.stockStatus,
          status: product.status,
          isFeatured: product.isFeatured,
          brochurePdf: product.brochurePdf ?? "",
          videoUrl: product.videoUrl ?? "",
          specifications: product.specifications.map((s) => ({
            label: s.label,
            value: s.value,
          })),
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          seoKeywords: product.seoKeywords,
        }}
      />
    </div>
  );
}
