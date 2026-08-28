import type { HomepageSection } from "@prisma/client";
import { HeroSection } from "./hero-section";
import { StatisticsSection } from "./statistics-section";
import { FeaturedProductsSection } from "./featured-products-section";
import { TestimonialsSection } from "./testimonials-section";
import { FaqSection } from "./faq-section";
import { CtaSection } from "./cta-section";

/**
 * Renders one HomepageSection row based on its `key`.
 *
 * Two kinds of sections:
 *  - Copy-driven (HERO, STATISTICS, CTA): render straight from the section's
 *    `content` JSON, editable from /admin/cms with zero code changes.
 *  - Data-driven (FEATURED_PRODUCTS, TESTIMONIALS, FAQ): ignore `content` and
 *    pull live rows from their own tables, so there's a single source of
 *    truth (Products/Testimonials/FAQs are managed in their own admin
 *    screens, not duplicated into a CMS blob).
 *
 * Sections without a matching component are skipped — they exist as rows
 * (ABOUT, INDUSTRIES_SERVED, MANUFACTURING_PROCESS, CERTIFICATES,
 * FACTORY_IMAGES, GLOBAL_PRESENCE, LATEST_BLOG, FOOTER) so admins can
 * reorder/toggle them, and get real components in the next pass.
 */
export function renderHomepageSection(section: HomepageSection) {
  switch (section.key) {
    case "HERO":
      return <HeroSection key={section.id} content={section.content as never} />;
    case "STATISTICS":
      return <StatisticsSection key={section.id} content={section.content as never} />;
    case "FEATURED_PRODUCTS":
      return <FeaturedProductsSection key={section.id} />;
    case "TESTIMONIALS":
      return <TestimonialsSection key={section.id} />;
    case "FAQ":
      return <FaqSection key={section.id} />;
    case "CTA":
      return <CtaSection key={section.id} content={section.content as never} />;
    default:
      return null;
  }
}
