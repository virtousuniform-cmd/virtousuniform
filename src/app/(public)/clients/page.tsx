import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Our Clients",
  description: "Distributors and businesses we've partnered with worldwide.",
};

export default function ClientsPage() {
  return (
    <>
      <PageHero
        eyebrow="Clients"
        title="Our Clients"
        description="Distributors and businesses we've partnered with worldwide."
      />
      <PagePendingNotice page="Our Clients" />
    </>
  );
}
