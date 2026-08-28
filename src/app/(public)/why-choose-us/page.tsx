import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Why Choose Us",
  description: "What sets our manufacturing, quality assurance, and export operations apart.",
};

export default function WhyChooseUsPage() {
  return (
    <>
      <PageHero
        eyebrow="Why Us"
        title="Why Choose Us"
        description="What sets our manufacturing, quality assurance, and export operations apart."
      />
      <PagePendingNotice page="Why Choose Us" />
    </>
  );
}
