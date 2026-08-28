import type { Metadata } from "next";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";
import { ContactInfoForm } from "@/features/settings/components/contact-info-form";
import { SocialLinksForm } from "@/features/settings/components/social-links-form";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const [contactInfo, socialLinks] = await Promise.all([
    settingsRepository.getContactInfo(),
    settingsRepository.getSocialLinks(),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Site-wide contact details and social links, used in the footer and Contact page.
        </p>
      </div>

      <ContactInfoForm defaultValues={contactInfo} />
      <SocialLinksForm defaultValues={socialLinks} />
    </div>
  );
}
