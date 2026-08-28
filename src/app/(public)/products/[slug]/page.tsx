import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { productRepository } from "@/features/products/repositories/product.repository";
import { savedProductRepository } from "@/features/products/repositories/saved-product.repository";
import { SaveProductButton } from "@/features/products/components/save-product-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);
  if (!product) return {};

  const title = product.seoTitle || product.name;
  const description =
    product.seoDescription || product.shortDescription || product.name;
  const image = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);
  if (!product) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const isSaved = session
    ? await savedProductRepository.isSaved(session.user.id, product.id)
    : false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.longDescription ?? undefined,
    sku: product.sku ?? undefined,
    image: product.images.map((i) => i.url),
    category: product.category?.name,
    brand: { "@type": "Brand", name: "Gloves Manufacturing Co." },
    offers: {
      "@type": "Offer",
      availability:
        product.stockStatus === "IN_STOCK"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      priceCurrency: "USD",
      price: "0", // B2B — pricing is quotation-based, not fixed.
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link
              href={`/products?categoryId=${product.category.id}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.slice(1, 6).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? product.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            {product.category && (
              <p className="text-sm font-medium text-brand uppercase">
                {product.category.name}
              </p>
            )}
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={product.stockStatus === "IN_STOCK" ? "success" : "outline"}>
                {product.stockStatus.replaceAll("_", " ")}
              </Badge>
              {product.sku && (
                <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
              )}
            </div>
          </div>

          {product.shortDescription && (
            <p className="text-muted-foreground">{product.shortDescription}</p>
          )}

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border p-4 text-sm">
            {product.material && <Spec label="Material" value={product.material} />}
            {product.application && <Spec label="Application" value={product.application} />}
            {product.moq && <Spec label="MOQ" value={product.moq} />}
            {product.packaging && <Spec label="Packaging" value={product.packaging} />}
            {product.weight && <Spec label="Weight" value={product.weight} />}
            {product.sizes.length > 0 && (
              <Spec label="Sizes" value={product.sizes.join(", ")} />
            )}
            {product.color.length > 0 && (
              <Spec label="Colors" value={product.color.join(", ")} />
            )}
            {product.specifications.map((spec) => (
              <Spec key={spec.id} label={spec.label} value={spec.value} />
            ))}
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" variant="brand" asChild>
              <Link href={`/request-quote?product=${product.slug}`}>Request a Quotation</Link>
            </Button>
            {product.brochurePdf && (
              <Button size="lg" variant="outline" asChild>
                <a href={product.brochurePdf} target="_blank" rel="noopener noreferrer">
                  Download Brochure
                </a>
              </Button>
            )}
            <SaveProductButton productId={product.id} initialSaved={isSaved} />
          </div>
        </div>
      </div>

      {product.longDescription && (
        <div className="mt-16 max-w-3xl">
          <h2 className="font-display text-xl font-semibold text-foreground">Product Details</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">
            {product.longDescription}
          </p>
        </div>
      )}

      {product.relatedTo.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-display text-xl font-semibold text-foreground">Related Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedTo.map((related) => (
              <Link
                key={related.id}
                href={`/products/${related.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card hover:shadow-md"
              >
                <div className="relative aspect-square bg-muted">
                  {related.images[0] && (
                    <Image
                      src={related.images[0].url}
                      alt={related.name}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-brand">
                    {related.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
