import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Export Markets",
  description: "The 40+ countries we currently supply, and our logistics capabilities.",
};

export default function ExportMarketsPage() {
  return (
    <>
      <PageHero
        eyebrow="Global Reach"
        title="Export Markets"
        description="The 40+ countries we currently supply, and our logistics capabilities."
      />
      <PagePendingNotice page="Export Markets" />
    </>
  );
}
