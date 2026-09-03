import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { contentPageRepository } from "@/features/cms/repositories/content-page.repository";
import { PageHero } from "@/components/shared/page-hero";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await contentPageRepository.findBySlug(slug);

  if (!page || page.status !== "PUBLISHED") return {};

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
  };
}

export default async function DynamicContentPage({ params }: Props) {
  const { slug } = await params;
  const page = await contentPageRepository.findBySlug(slug);

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  // Clean the content if it somehow got wrapped in markdown code blocks during seeding/editing
  const cleanContent = page.content.replace(/^```html\n?/, "").replace(/\n?```$/, "");

  return (
    <div>
      <div className="bg-primary py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl">
            {page.title}
          </h1>
          {page.seoDescription && (
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70 text-lg">
              {page.seoDescription}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div
          className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-semibold prose-a:text-brand text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      </div>
    </div>
  );
}
