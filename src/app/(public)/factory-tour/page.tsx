import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Factory Tour",
  description: "A look inside our production floor, from raw material to final packaging.",
};

export default function FactoryTourPage() {
  return (
    <>
      <PageHero
        eyebrow="Facility"
        title="Factory Tour"
        description="A look inside our production floor, from raw material to final packaging."
      />
      <PagePendingNotice page="Factory Tour" />
    </>
  );
}
