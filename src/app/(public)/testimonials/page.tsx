import type { Metadata } from "next";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "What our partners and customers say about working with us.",
};

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="What Our Partners Say"
        description="Feedback from distributors and businesses we've worked with worldwide."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {testimonials.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No testimonials published yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-3 flex gap-0.5 text-warning">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-sm text-foreground">
                  &ldquo;{t.review}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <p className="font-medium text-foreground">{t.customerName}</p>
                  <p className="text-muted-foreground">
                    {[t.companyName, t.country].filter(Boolean).join(" · ")}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
