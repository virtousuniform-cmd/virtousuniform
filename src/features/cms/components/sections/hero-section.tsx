"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVisualLoader } from "./hero-visual-loader";
import { TrustBadgeMarquee } from "./trust-badge-marquee";
import { HeroBackgroundSlider } from "./hero-background-slider";
import { DownloadCatalogueButton } from "@/features/products/components/download-catalogue-button";
import { AnimatePresence, motion } from "motion/react";

type HeroSlide = {
  image: string;
  headline: string;
  subheadline: string;
};

type HeroContent = {
  slides?: HeroSlide[];
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export function HeroSection({ content }: { content: HeroContent }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showText, setShowText] = useState(true);

  const slides = content.slides || [];
  const currentSlide = slides[slideIndex] || {
    headline: (content as any).headline || "VU Gloves",
    subheadline: (content as any).subheadline || "Premium Professional Protective Gear",
  };

  // Re-trigger text animation whenever slide changes
  useEffect(() => {
    setShowText(false);
    // Wait for the image slide animation to almost finish before starting text
    const timer = setTimeout(() => setShowText(true), 600);
    return () => clearTimeout(timer);
  }, [slideIndex]);

  const imageList = slides.map(s => s.image);

  return (
    <>
      <section className="relative overflow-hidden bg-primary min-h-[90vh] md:min-h-[750px] flex items-center">
        {/* Background Images Layer */}
        <HeroBackgroundSlider images={imageList} onIndexChange={setSlideIndex} />

        {/* Content Layer */}
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 lg:grid-cols-[1.2fr_0.8fr] w-full">
          <div className="text-center lg:text-left min-h-[400px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {showText && (
                <motion.div
                  key={slideIndex}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    staggerChildren: 0.1
                  }}
                >
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-2xl"
                  >
                    {currentSlide.headline}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mx-auto mt-6 max-w-2xl text-lg text-white/90 lg:mx-0 font-medium drop-shadow-lg leading-relaxed md:text-xl"
                  >
                    {currentSlide.subheadline}
                  </motion.p>

                    <div className="mt-12 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                      {content.ctaPrimary && (
                        <Button size="lg" variant="brand" asChild className="shadow-2xl h-16 px-10 text-lg group">
                          <Link href={content.ctaPrimary.href}>
                            {content.ctaPrimary.label}
                            <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      )}
                      {content.ctaSecondary && (
                        <Button
                          size="lg"
                          variant="outline"
                          asChild
                          className="border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 h-16 px-10 text-lg"
                        >
                          <Link href={content.ctaSecondary.href}>{content.ctaSecondary.label}</Link>
                        </Button>
                      )}
                      <div className="hidden sm:block">
                        <DownloadCatalogueButton variant="white" />
                      </div>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Optional Right Side Visual (Cards) */}
          <div className="hidden lg:block">
            <HeroVisualLoader />
          </div>
        </div>

        {/* Progress Bar (Visual indicator of slide timing) */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/10 w-full z-20">
          <motion.div
            key={slideIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-brand"
          />
        </div>
      </section>

      <TrustBadgeMarquee />
    </>
  );
}
