import type { Metadata } from "next";
import { homepageRepository } from "@/features/cms/repositories/homepage.repository";
import { SectionEditorCard } from "@/features/cms/components/section-editor-card";

export const metadata: Metadata = { title: "Homepage CMS — Admin" };

export default async function AdminCmsPage() {
  const sections = await homepageRepository.findAll();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Homepage CMS</h1>
        <p className="text-sm text-muted-foreground">
          Edit copy and toggle visibility for each homepage section — changes reflect on{" "}
          the live site immediately.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <SectionEditorCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
