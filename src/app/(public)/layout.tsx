import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { contentPageRepository } from "@/features/cms/repositories/content-page.repository";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pages, branding, contactInfo] = await Promise.all([
    contentPageRepository.findMany(),
    settingsRepository.getBranding(),
    settingsRepository.getContactInfo(),
  ]);

  const publishedSlugs = pages
    .filter((p) => p.status === "PUBLISHED")
    .map((p) => p.slug);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader publishedSlugs={publishedSlugs} branding={branding} />
      <main className="flex-1">{children}</main>
      <SiteFooter publishedSlugs={publishedSlugs} branding={branding} />
      <WhatsAppFloat phone={contactInfo.whatsapp} />
    </div>
  );
}
