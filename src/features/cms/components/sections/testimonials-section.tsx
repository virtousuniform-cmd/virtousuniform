import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export async function TestimonialsSection() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true, isFeatured: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-sm font-medium tracking-wide text-brand uppercase">
              Testimonials
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Trusted by Partners Worldwide
            </h2>
          </div>
        </Reveal>

        <RevealGroup className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem key={t.id}>
              <figure className="h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-3 flex gap-0.5 text-brand">
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
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
