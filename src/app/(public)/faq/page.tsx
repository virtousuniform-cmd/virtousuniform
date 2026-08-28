import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { FaqSection } from "@/features/cms/components/sections/faq-section";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about ordering, MOQ, certifications, and shipping.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Frequently Asked Questions"
        description="Can't find what you're looking for? Reach out to our team directly."
      />
      <FaqSection showHeading={false} />
    </>
  );
}
