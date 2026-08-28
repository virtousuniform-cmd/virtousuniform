import type { HomepageSection } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionVisibilityToggle } from "./section-visibility-toggle";
import { HeroSectionEditor } from "./editors/hero-section-editor";
import { StatisticsSectionEditor } from "./editors/statistics-section-editor";
import { CtaSectionEditor } from "./editors/cta-section-editor";

const SECTION_LABELS: Record<string, string> = {
  HERO: "Hero",
  ABOUT: "About",
  STATISTICS: "Statistics",
  FEATURED_PRODUCTS: "Featured Products",
  INDUSTRIES_SERVED: "Industries Served",
  MANUFACTURING_PROCESS: "Manufacturing Process",
  CERTIFICATES: "Certificates",
  FACTORY_IMAGES: "Factory Images",
  TESTIMONIALS: "Testimonials",
  GLOBAL_PRESENCE: "Global Presence",
  LATEST_BLOG: "Latest Blog",
  FAQ: "FAQ",
  CTA: "Call to Action",
  FOOTER: "Footer",
};

const DATA_DRIVEN_KEYS = new Set(["FEATURED_PRODUCTS", "TESTIMONIALS", "FAQ"]);

export function SectionEditorCard({ section }: { section: HomepageSection }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{SECTION_LABELS[section.key] ?? section.key}</CardTitle>
        <SectionVisibilityToggle sectionKey={section.key} isVisible={section.isVisible} />
      </CardHeader>
      <CardContent>{renderEditor(section)}</CardContent>
    </Card>
  );
}

function renderEditor(section: HomepageSection) {
  switch (section.key) {
    case "HERO":
      return <HeroSectionEditor content={section.content as never} />;
    case "STATISTICS":
      return <StatisticsSectionEditor content={section.content as never} />;
    case "CTA":
      return <CtaSectionEditor content={section.content as never} />;
    default:
      if (DATA_DRIVEN_KEYS.has(section.key)) {
        return (
          <p className="text-sm text-muted-foreground">
            This section pulls live content from its own admin screen —{" "}
            {section.key === "FEATURED_PRODUCTS" && "mark products as Featured in Products"}
            {section.key === "TESTIMONIALS" && "approve and feature testimonials in Testimonials"}
            {section.key === "FAQ" && "manage entries in FAQ"}. Use the toggle above to
            show or hide it on the homepage.
          </p>
        );
      }
      return (
        <p className="text-sm text-muted-foreground">
          Content editor for this section is pending — no renderer exists on the
          homepage yet either, so the visibility toggle has no effect until it's built.
        </p>
      );
  }
}
