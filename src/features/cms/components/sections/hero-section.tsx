"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { HeroVisualLoader } from "./hero-visual-loader";
import { TrustBadgeMarquee } from "./trust-badge-marquee";
import { HeroBackgroundSlider } from "./hero-background-slider";
import { AnimatePresence, motion } from "motion/react";

type HeroContent = {
  headline: string;
  subheadline?: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  images?: string[];
};

export function HeroSection({ content }: { content: HeroContent }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showText, setShowText] = useState(true);

  // Trigger text re-animation on slide change
  useEffect(() => {
    setShowText(false);
    const timer = setTimeout(() => setShowText(true), 1200); // 1.2s delay to let image settle
    return () => clearTimeout(timer);
  }, [slideIndex]);

  return (
    <>
      <section className="relative overflow-hidden bg-primary min-h-[85vh] md:min-h-[700px] flex items-center">
        <HeroBackgroundSlider images={content.images} onIndexChange={setSlideIndex} />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 lg:grid-cols-[1.1fr_0.9fr] lg:pt-40 lg:pb-44 w-full">
          <div className="text-center lg:text-left min-h-[300px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {showText && (
                <motion.div
                  key={slideIndex} // Re-animate on every slide
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-primary-foreground sm:text-5xl lg:text-7xl drop-shadow-2xl">
                    {content.headline}
                  </h1>

                  {content.subheadline && (
                    <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/90 lg:mx-0 font-medium drop-shadow-lg leading-relaxed">
                      {content.subheadline}
                    </p>
                  )}

                  {(content.ctaPrimary || content.ctaSecondary) && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                      {content.ctaPrimary && (
                        <Button size="lg" variant="brand" asChild className="shadow-2xl h-14 px-8 text-base">
                          <Link href={content.ctaPrimary.href}>
                            {content.ctaPrimary.label}
                            <ArrowRight className="ml-2 size-5" />
                          </Link>
                        </Button>
                      )}
                      {content.ctaSecondary && (
                        <Button
                          size="lg"
                          variant="outline"
                          asChild
                          className="border-white/40 bg-black/30 backdrop-blur-md text-primary-foreground hover:bg-white/20 h-14 px-8 text-base"
                        >
                          <Link href={content.ctaSecondary.href}>{content.ctaSecondary.label}</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
