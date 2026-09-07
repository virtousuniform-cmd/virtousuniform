import type { Metadata } from "next";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";
import { ContactInfoForm } from "@/features/settings/components/contact-info-form";
import { SocialLinksForm } from "@/features/settings/components/social-links-form";
import { CatalogSettingsForm } from "@/features/settings/components/catalog-settings-form";
import { BrandingSettingsForm } from "@/features/settings/components/branding-settings-form";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const [contactInfo, socialLinks, catalogSettings, branding] = await Promise.all([
    settingsRepository.getContactInfo(),
    settingsRepository.getSocialLinks(),
    settingsRepository.getCatalogSettings(),
    settingsRepository.getBranding(),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your company's visual identity, contact details, and public display preferences.
        </p>
      </div>

      <BrandingSettingsForm defaultValues={branding} />
      <CatalogSettingsForm defaultValues={catalogSettings} />
      <ContactInfoForm defaultValues={contactInfo} />
      <SocialLinksForm defaultValues={socialLinks} />
    </div>
  );
}
