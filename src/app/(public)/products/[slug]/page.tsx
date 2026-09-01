import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { productRepository } from "@/features/products/repositories/product.repository";
import { categoryRepository } from "@/features/categories/repositories/category.repository";
import { savedProductRepository } from "@/features/products/repositories/saved-product.repository";
import { SaveProductButton } from "@/features/products/components/save-product-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Info, Layers, Crosshair } from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Check if it's a product first
  const product = await productRepository.findBySlug(slug);
  if (product) {
    const title = product.seoTitle || product.name;
    const description = product.seoDescription || product.shortDescription || product.name;
    const image = product.images[0]?.url;
    return {
      title,
      description,
      alternates: { canonical: `/products/${product.slug}` },
    };
  }

  // Check if it's a category
  const category = await categoryRepository.findBySlug(slug);
  if (category) {
    return {
      title: `${category.name} | Virtous Uniform`,
      description: category.description || `Browse our selection of ${category.name}.`,
    };
  }

  return {};
}

export default async function ProductOrCategoryPage({ params }: Props) {
  const { slug } = await params;

  const [product, category] = await Promise.all([
    productRepository.findBySlug(slug),
    categoryRepository.findBySlug(slug),
  ]);

  if (product) {
    return <ProductDetailView product={product} />;
  }

  if (category) {
    return <CategoryListingView category={category} />;
  }

  notFound();
}

async function ProductDetailView({ product }: { product: any }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSaved = session
    ? await savedProductRepository.isSaved(session.user.id, product.id)
    : false;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link
              href={`/products/${product.category.slug}`}
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
        {/* Large Product Gallery */}
        <div className="space-y-4">
          <div className="group relative aspect-square overflow-hidden rounded-2xl bg-card border border-border shadow-sm">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image available
              </div>
            )}
            {product.isFeatured && (
              <Badge variant="brand" className="absolute top-4 left-4">Featured</Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((img: any) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card hover:border-brand transition-colors cursor-pointer"
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? product.name}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            {product.category && (
              <p className="text-sm font-medium text-brand uppercase tracking-wider">
                {product.category.name}
              </p>
            )}
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge variant={product.stockStatus === "IN_STOCK" ? "success" : "outline"} className="px-3 py-1">
                {product.stockStatus.replaceAll("_", " ")}
              </Badge>
              {product.sku && (
                <span className="text-sm font-mono text-muted-foreground">SKU: {product.sku}</span>
              )}
            </div>
          </div>

          {product.shortDescription && (
            <p className="text-lg leading-relaxed text-muted-foreground font-medium">
              {product.shortDescription}
            </p>
          )}

          {/* New Protection & Material Info */}
          <div className="grid grid-cols-2 gap-4">
            {product.protectionLevel && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Shield className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Protection</p>
                  <p className="text-sm font-semibold">{product.protectionLevel}</p>
                </div>
              </div>
            )}
            {product.material && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Material</p>
                  <p className="text-sm font-semibold">{product.material}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 border-t border-border pt-8">
            <Button size="lg" variant="brand" className="h-14 px-8 text-base shadow-lg shadow-brand/20" asChild>
              <Link href={`/request-quote?product=${product.slug}`}>Request a Quotation</Link>
            </Button>
            <SaveProductButton productId={product.id} initialSaved={isSaved} />
          </div>

          {/* Detailed Specs Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 text-sm">
            {product.coating && <Spec label="Coating" value={product.coating} />}
            {product.moq && <Spec label="MOQ" value={product.moq} />}
            {product.packaging && <Spec label="Packaging" value={product.packaging} />}
            {product.weight && <Spec label="Weight" value={product.weight} />}
            {product.sizes.length > 0 && (
              <Spec label="Sizes" value={product.sizes.join(", ")} />
            )}
            {product.colors.length > 0 && (
              <Spec label="Colors" value={product.colors.join(", ")} />
            )}
          </div>
        </div>
      </div>

      {/* Applications & Features Tabs-like Sections */}
      <div className="mt-24 grid gap-16 lg:grid-cols-2">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Crosshair className="size-5 text-brand" />
            <h2 className="font-display text-2xl font-bold">Applications</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Optimized for performance in the following industrial and professional sectors:
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {product.applications.map((app: string) => (
              <li key={app} className="flex items-center gap-2 text-sm text-foreground/80 bg-muted/30 px-3 py-2 rounded-lg border border-border/50">
                <CheckCircle2 className="size-4 text-success" />
                {app.trim()}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Info className="size-5 text-brand" />
            <h2 className="font-display text-2xl font-bold">Key Features</h2>
          </div>
          <ul className="grid gap-3">
            {product.features.map((feature: string) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                <div className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                {feature}
              </li>
            ))}
            {product.specifications.map((spec: any) => (
              <li key={spec.id} className="flex items-start gap-3 text-sm text-foreground/80">
                <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="font-semibold text-foreground/90">{spec.label}:</span> {spec.value}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {product.longDescription && (
        <div className="mt-20 border-t border-border pt-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Product Technical Overview</h2>
          <div className="max-w-4xl prose prose-slate dark:prose-invert">
            <p className="whitespace-pre-line text-muted-foreground leading-loose text-lg">
              {product.longDescription}
            </p>
          </div>
        </div>
      )}

      {/* Related Products */}
      {product.relatedTo.length > 0 && (
        <div className="mt-24 border-t border-border pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground">Recommended Alternatives</h2>
            <Link href="/products" className="text-sm font-semibold text-brand hover:underline">View all catalog →</Link>
          </div>
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedTo.map((related: any) => (
              <RevealItem key={related.id}>
                <TiltCard className="h-full">
                  <Link
                    href={`/products/${related.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-square bg-muted">
                      {related.images[0] && (
                        <Image
                          src={related.images[0].url}
                          alt={related.name}
                          fill
                          sizes="240px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors line-clamp-2">
                        {related.name}
                      </h3>
                      <p className="mt-auto pt-2 text-xs font-semibold text-brand uppercase tracking-tighter">View Details →</p>
                    </div>
                  </Link>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      )}
    </div>
  );
}

function CategoryListingView({ category }: { category: any }) {
  return (
    <div>
      <div className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="mb-4 text-sm text-primary-foreground/50">
            <Link href="/products" className="hover:text-primary-foreground">Products</Link>
            {" / "}
            <span className="text-primary-foreground">{category.name}</span>
          </nav>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/70">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {category.products.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border py-32 text-center">
            <p className="text-xl font-medium text-muted-foreground">No products found in this category.</p>
            <Button variant="brand" className="mt-6" asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        ) : (
          <RevealGroup className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {category.products.map((product: any) => (
              <RevealItem key={product.id}>
                <TiltCard className="h-full">
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-2xl hover:border-brand/20"
                  >
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText ?? product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image available
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-brand transition-colors">
                        {product.name}
                      </h3>
                      {product.shortDescription && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                          {product.shortDescription}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest px-2 py-0">View Specs</Badge>
                        <span className="text-brand font-bold text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">Explore →</span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
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
