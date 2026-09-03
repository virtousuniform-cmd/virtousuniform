import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/reveal";
import { FeaturedCategoriesGrid } from "./featured-categories-grid";

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

      <FeaturedCategoriesGrid categories={categories} />
    </section>
  );
}
