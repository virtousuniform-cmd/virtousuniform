import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Research & Development",
  description: "How we develop new materials, constructions, and protective technologies.",
};

export default function ResearchDevelopmentPage() {
  return (
    <>
      <PageHero
        eyebrow="Innovation"
        title="Research & Development"
        description="How we develop new materials, constructions, and protective technologies."
      />
      <PagePendingNotice page="Research & Development" />
    </>
  );
}
