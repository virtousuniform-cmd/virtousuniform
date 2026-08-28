import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "About Us",
  description: "Our story, mission, and the team behind two decades of glove manufacturing excellence.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="About Us"
        description="Our story, mission, and the team behind two decades of glove manufacturing excellence."
      />
      <PagePendingNotice page="About Us" />
    </>
  );
}
