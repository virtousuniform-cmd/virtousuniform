import type { Metadata } from "next";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";
import { SeoDefaultsForm } from "@/features/settings/components/seo-defaults-form";

export const metadata: Metadata = { title: "SEO — Admin" };

export default async function AdminSeoPage() {
  const seoDefaults = await settingsRepository.getSeoDefaults();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">SEO</h1>
        <p className="text-sm text-muted-foreground">
          Site-wide metadata defaults. Individual products, blog posts, and categories can
          still override these with their own SEO fields.
        </p>
      </div>

      <SeoDefaultsForm defaultValues={seoDefaults} />
    </div>
  );
}
