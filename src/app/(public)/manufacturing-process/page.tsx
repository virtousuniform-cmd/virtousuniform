import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Manufacturing Process",
  description: "A step-by-step look at how raw material becomes a certified, export-ready glove.",
};

export default function ManufacturingProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Process"
        title="Manufacturing Process"
        description="A step-by-step look at how raw material becomes a certified, export-ready glove."
      />
      <PagePendingNotice page="Manufacturing Process" />
    </>
  );
}
