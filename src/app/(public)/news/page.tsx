import type { Metadata } from "next";
import { PageHero, PagePendingNotice } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "News",
  description: "Company announcements, trade show appearances, and industry updates.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="News"
        title="News"
        description="Company announcements, trade show appearances, and industry updates."
      />
      <PagePendingNotice page="News" />
    </>
  );
}
