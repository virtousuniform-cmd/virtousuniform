import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { contentPageRepository } from "@/features/cms/repositories/content-page.repository";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await contentPageRepository.findMany();
  const publishedSlugs = pages
    .filter((p) => p.status === "PUBLISHED")
    .map((p) => p.slug);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader publishedSlugs={publishedSlugs} />
      <main className="flex-1">{children}</main>
      <SiteFooter publishedSlugs={publishedSlugs} />
    </div>
  );
}
