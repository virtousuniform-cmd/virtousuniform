import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: {
      category: true,
      author: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt?.toISOString(),
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
    image: post.featuredImage ?? undefined,
  };

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
        {post.category && (
          <>
            {" / "}
            <span>{post.category.name}</span>
          </>
        )}
      </nav>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {post.author && <span>{post.author.name}</span>}
        {post.publishedAt && (
          <>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
          </>
        )}
      </div>

      {post.featuredImage && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="prose prose-neutral mt-10 max-w-none whitespace-pre-line text-foreground">
        {post.content}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
          {post.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
