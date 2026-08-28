"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A card that tilts in 3D space toward the cursor, like light catching a
 * physical surface. Implemented with raw pointer events + CSS transforms
 * rather than a physics/animation library: it's a handful of lines, has
 * zero bundle cost beyond this file, and only does work on pointermove
 * (not a persistent animation loop), so it doesn't compete with the rest
 * of the page for frame budget.
 *
 * Automatically no-ops under prefers-reduced-motion via the global CSS rule.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 8,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1

    const rotateY = (x - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - y) * maxTilt * 2;

    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glare && glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, oklch(1 0 0 / 0.18), transparent 60%)`;
    }
  }

  function handlePointerLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    if (glareRef.current) glareRef.current.style.background = "transparent";
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("tilt-surface relative", className)}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-[background] duration-150"
        />
      )}
    </div>
  );
}
