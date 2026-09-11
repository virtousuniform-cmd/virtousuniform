import { prisma } from "@/lib/prisma";
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
    <section className="mx-auto max-w-7xl px-6 py-16">
      <FeaturedCategoriesGrid categories={categories} />
    </section>
  );
}
