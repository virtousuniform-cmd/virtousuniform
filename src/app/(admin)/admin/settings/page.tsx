import type { Metadata } from "next";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";
import { ContactInfoForm } from "@/features/settings/components/contact-info-form";
import { SocialLinksForm } from "@/features/settings/components/social-links-form";
import { CatalogSettingsForm } from "@/features/settings/components/catalog-settings-form";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const [contactInfo, socialLinks, catalogSettings] = await Promise.all([
    settingsRepository.getContactInfo(),
    settingsRepository.getSocialLinks(),
    settingsRepository.getCatalogSettings(),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage site-wide contact details, social links, and public product display visibility.
        </p>
      </div>

      <CatalogSettingsForm defaultValues={catalogSettings} />
      <ContactInfoForm defaultValues={contactInfo} />
      <SocialLinksForm defaultValues={socialLinks} />
    </div>
  );
}
