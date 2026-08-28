"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only allowed inside a Client Component in the App
// Router — this thin wrapper exists solely so hero-section.tsx (a Server
// Component) can render the GSAP-driven visual without itself becoming
// a Client Component.
const HeroVisual = dynamic(() => import("./hero-visual").then((m) => m.HeroVisual), {
  ssr: false,
});

export function HeroVisualLoader() {
  return <HeroVisual />;
}
