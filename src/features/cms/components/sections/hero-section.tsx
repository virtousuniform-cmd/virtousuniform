import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { HeroVisualLoader } from "./hero-visual-loader";
import { TrustBadgeMarquee } from "./trust-badge-marquee";

type HeroContent = {
  headline: string;
  subheadline?: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-brand">
        {/* Decorative animated gradient mesh — pure CSS, no JS cost */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-90" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 lg:grid-cols-[1.1fr_0.9fr] lg:pt-40 lg:pb-44">
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand">
                ISO 9001 &amp; CE Certified Manufacturer
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                {content.headline}
              </h1>
            </Reveal>
            {content.subheadline && (
              <Reveal delay={0.15}>
                <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/75 lg:mx-0">
                  {content.subheadline}
                </p>
              </Reveal>
            )}
            {(content.ctaPrimary || content.ctaSecondary) && (
              <Reveal delay={0.25}>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  {content.ctaPrimary && (
                    <Button size="lg" variant="brand" asChild>
                      <Link href={content.ctaPrimary.href}>
                        {content.ctaPrimary.label}
                        <ArrowRight />
                      </Link>
                    </Button>
                  )}
                  {content.ctaSecondary && (
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
                    >
                      <Link href={content.ctaSecondary.href}>{content.ctaSecondary.label}</Link>
                    </Button>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          <div className="hidden lg:block">
            <HeroVisualLoader />
          </div>
        </div>
      </section>

      <TrustBadgeMarquee />
    </>
  );
}
