import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

type CtaContent = {
  headline: string;
  subheadline?: string;
  cta?: { label: string; href: string };
};

export function CtaSection({ content }: { content: CtaContent }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-brand px-8 py-14 text-center">
          <div className="absolute inset-0 bg-gradient-mesh opacity-60" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display text-2xl font-semibold text-primary-foreground sm:text-3xl">
              {content.headline}
            </h2>
            {content.subheadline && (
              <p className="mx-auto mt-3 max-w-xl text-primary-foreground/75">
                {content.subheadline}
              </p>
            )}
            {content.cta && (
              <Button size="lg" variant="brand" asChild className="mt-8">
                <Link href={content.cta.href}>{content.cta.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
