import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Quality Assurance",
  description: "Our multi-stage inspection process and the standards every batch is held to.",
};

export default function QualityAssurancePage() {
  return (
    <>
      <PageHero
        eyebrow="Quality"
        title="Quality Assurance"
        description="Our multi-stage inspection process and the standards every batch is held to."
      />
      <PagePendingNotice page="Quality Assurance" />
    </>
  );
}
