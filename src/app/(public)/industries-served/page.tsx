import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Industries Served",
  description: "The sectors that rely on our gloves — from manufacturing to healthcare.",
};

export default function IndustriesServedPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Industries Served"
        description="The sectors that rely on our gloves — from manufacturing to healthcare."
      />
      <PagePendingNotice page="Industries Served" />
    </>
  );
}
