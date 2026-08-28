import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { savedProductRepository } from "@/features/products/repositories/saved-product.repository";
import { SaveProductButton } from "@/features/products/components/save-product-button";

export const metadata: Metadata = { title: "Saved Products" };

export default async function SavedProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const saved = await savedProductRepository.findByUser(session!.user.id);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Saved Products</h1>
        <p className="text-sm text-muted-foreground">
          {saved.length} product{saved.length === 1 ? "" : "s"} saved
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Heart className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No saved products yet.</p>
          <Link href="/products" className="text-sm text-primary hover:underline">
            Browse the catalog →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map(({ product }) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[4/3] bg-muted">
                  {product.images[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].altText ?? product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  )}
                </div>
              </Link>
              <div className="space-y-2 p-4">
                {product.category && (
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {product.category.name}
                  </p>
                )}
                <Link
                  href={`/products/${product.slug}`}
                  className="block font-medium text-foreground hover:text-primary"
                >
                  {product.name}
                </Link>
                <SaveProductButton productId={product.id} initialSaved={true} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
