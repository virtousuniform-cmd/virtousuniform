"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function FeaturedCategoriesGrid({ categories = [] }: { categories: any[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <RevealGroup className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const isTouchActive = activeId === category.id;

        return (
          <RevealItem key={category.id}>
            <div
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-lg cursor-pointer"
              onMouseEnter={() => setActiveId(category.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId(activeId === category.id ? null : category.id)}
            >
              {/* Category Main Image */}
              <div className="absolute inset-0">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
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
              <div className={cn(
                "absolute inset-0 flex items-center justify-center p-6 text-center transition-opacity duration-300",
                isTouchActive ? "opacity-0" : "opacity-100 group-hover:opacity-0"
              )}>
                <h3 className="font-display text-3xl font-bold text-white uppercase tracking-tighter drop-shadow-lg">
                  {category.name}
                </h3>
              </div>

              {/* Hover/Touch Content - Products List */}
              <div className={cn(
                "absolute inset-0 flex flex-col justify-end p-6 transition-all duration-500",
                isTouchActive
                  ? "opacity-100 translate-y-0 bg-black/60 backdrop-blur-[2px]"
                  : "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-black/60 group-hover:backdrop-blur-[2px]"
              )}>
                <h3 className="mb-4 font-display text-xl font-bold text-white border-b border-white/20 pb-2">
                  {category.name}
                </h3>

                <div className="mb-6 space-y-2">
                  {category.products.map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-3 text-white/90 hover:text-brand transition-colors group/item"
                    >
                      <div className="size-8 shrink-0 overflow-hidden rounded bg-white/10">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={32}
                            height={32}
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
        );
      })}
    </RevealGroup>
  );
}
