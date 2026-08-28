import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

export async function FeaturedProductsSection() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, status: "PUBLISHED", deletedAt: null },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand uppercase">
              Featured
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Featured Products
            </h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>
      </Reveal>

      <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <RevealItem key={product.id}>
            <TiltCard maxTilt={6} className="rounded-xl">
              <Link
                href={`/products/${product.slug}`}
                className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {product.images[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].altText ?? product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <Badge variant="brand" className="absolute top-3 left-3">
                    Featured
                  </Badge>
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="font-medium text-foreground group-hover:text-brand">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {product.shortDescription}
                    </p>
                  )}
                </div>
              </Link>
            </TiltCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
