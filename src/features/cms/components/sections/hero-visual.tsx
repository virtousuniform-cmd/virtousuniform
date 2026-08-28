"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Scissors, Droplets, Ruler, Package } from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";

// Technical spec badges rather than repeating the trust-marquee content
// below — reinforces product credibility with the kind of concrete,
// verifiable numbers a buyer is actually scanning for (cut level,
// coating spec, EN rating), the same pattern real PPE brands like
// Ansell use on their product pages.
const CARDS = [
  { icon: Scissors, label: "Cut Level A5", tone: "text-brand" },
  { icon: Droplets, label: "0.5mm Nitrile Coat", tone: "text-brand-cyan" },
  { icon: Ruler, label: "EN 388: 4X42D", tone: "text-brand-violet" },
  { icon: Package, label: "MOQ 5,000 Pairs", tone: "text-brand" },
] as const;

/**
 * Client-only, dynamically imported with `ssr: false` from HeroSection —
 * GSAP reads layout on mount, so there's nothing useful to server-render
 * here, and skipping SSR avoids a hydration mismatch on first paint.
 */
export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll("[data-hero-card]");
    if (!cards?.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, rotateX: -15, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto grid max-w-md grid-cols-2 gap-4"
      style={{ perspective: "1200px" }}
    >
      {CARDS.map(({ icon: Icon, label, tone }, i) => (
        <div
          key={label}
          data-hero-card
          className="animate-float"
          style={{ animationDelay: `${i * 0.4}s` }}
        >
          <TiltCard
            maxTilt={10}
            className="rounded-xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur-md"
          >
            <Icon className={`size-6 ${tone}`} />
            <p className="mt-2 text-sm font-medium text-primary-foreground">{label}</p>
          </TiltCard>
        </div>
      ))}
    </div>
  );
}
