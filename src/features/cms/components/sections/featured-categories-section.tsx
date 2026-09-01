import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export async function FeaturedCategoriesSection() {
  const categories = await prisma.category.findMany({
    where: { isFeaturedOnHome: true, isVisible: true, deletedAt: null },
    include: {
      products: {
        where: { status: "PUBLISHED", deletedAt: null },
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <Reveal>
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="text-sm font-bold tracking-widest text-brand uppercase">
            Our Collections
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Browse by Category
          </h2>
          <div className="mt-4 h-1 w-20 bg-brand" />
        </div>
      </Reveal>

      <RevealGroup className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <RevealItem key={category.id}>
            <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-lg">
              {/* Category Main Image (Placeholder if missing) */}
              <div className="absolute inset-0">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary/10 text-primary/20">
                    <ShoppingCart className="size-20" />
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Category Name - Bold & Centered Initially */}
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center transition-opacity duration-300 group-hover:opacity-0">
                <h3 className="font-display text-3xl font-bold text-white uppercase tracking-tighter">
                  {category.name}
                </h3>
              </div>

              {/* Hover Content - Products List */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                <h3 className="mb-4 font-display text-xl font-bold text-white border-b border-white/20 pb-2">
                  {category.name}
                </h3>

                <div className="mb-6 space-y-3">
                  {category.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-3 text-white/80 hover:text-brand transition-colors group/item"
                    >
                      <div className="size-10 shrink-0 overflow-hidden rounded bg-white/10">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="truncate text-sm font-medium">{product.name}</span>
                    </Link>
                  ))}
                  {category.products.length === 0 && (
                    <p className="text-xs text-white/50 italic">New collection arriving soon.</p>
                  )}
                </div>

                <Link
                  href={`/products?categoryId=${category.id}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline"
                >
                  View Collection <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
