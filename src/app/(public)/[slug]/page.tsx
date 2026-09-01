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

  return (
    <>
      <PageHero
        title={page.title}
        description={page.seoDescription || ""}
      />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div
          className="prose prose-slate max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </>
  );
}
