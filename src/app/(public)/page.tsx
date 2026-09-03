import type { Metadata } from "next";
import { homepageRepository } from "@/features/cms/repositories/homepage.repository";
import { renderHomepageSection } from "@/features/cms/components/sections";

export const metadata: Metadata = {
  title: "Home",
  description:
    "ISO-certified manufacturer of industrial, medical, and protective gloves, exporting worldwide.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sections = await homepageRepository.findVisibleOrdered();

  return <>{sections.map(renderHomepageSection)}</>;
}
