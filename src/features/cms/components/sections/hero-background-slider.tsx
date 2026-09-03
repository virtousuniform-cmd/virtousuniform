"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export function HeroBackgroundSlider({
  images = [],
  onIndexChange
}: {
  images?: string[];
  onIndexChange?: (index: number) => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % images.length;
        onIndexChange?.(next);
        return next;
      });
    }, 5000); // 5 seconds for smoother feel
    return () => clearInterval(timer);
  }, [images.length, onIndexChange]);

  if (images.length === 0) {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-mesh opacity-90" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0zm10 0h1v1h-1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />
      </>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={images[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[index] || ""}
            alt="Hero Background"
            fill
            priority
            className="object-cover object-center md:object-[center_20%]"
          />
          {/* Overlay to ensure text legibility */}
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
