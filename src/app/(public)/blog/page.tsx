import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/shared/page-hero";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Industry insights, product updates, and company news.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { category: true, author: { select: { name: true } } },
    take: 24,
  });

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights & Updates"
        description="Industry trends, product spotlights, and news from our manufacturing floor."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-24 text-center">
            <p className="text-muted-foreground">
              No posts published yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card hover:shadow-md"
              >
                <div className="relative aspect-[16/10] bg-muted">
                  {post.featuredImage && (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="space-y-2 p-4">
                  {post.category && (
                    <p className="text-xs font-medium text-brand uppercase">
                      {post.category.name}
                    </p>
                  )}
                  <h3 className="font-medium text-foreground group-hover:text-brand">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  {post.publishedAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
