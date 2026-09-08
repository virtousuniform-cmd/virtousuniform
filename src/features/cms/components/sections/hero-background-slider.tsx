"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { CSSProperties } from "react";

type HeroSlide = {
  image: string;
  mobile?: string;
  mobilePosition?: string;
};

export function HeroBackgroundSlider({
  slides = [],
  onIndexChange
}: {
  slides?: HeroSlide[];
  onIndexChange?: (index: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  const nextSlide = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  if (slides.length === 0) {
    return (
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl" />
    );
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30, duration: 0.8 },
            opacity: { duration: 0.6 },
            scale: { duration: 1.2, ease: "easeOut" }
          }}
          className="absolute inset-0"
        >
          {(() => {
            const slide = slides[index];
            if (!slide) return null;

            const imageClassName =
              "hero-slide-image object-cover object-center md:object-top";
            const imageStyle = {
              "--hero-mobile-position": slide.mobilePosition ?? "center",
            } as CSSProperties;

            return (
              <picture className="absolute inset-0 block">
                {slide.mobile && (
                  <source media="(max-width: 767px)" srcSet={slide.mobile} />
                )}
                <Image
                  src={slide.image}
                  alt={`Hero Background ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={imageClassName}
                  style={imageStyle}
                />
              </picture>
            );
          })()}
          {/* Professional Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
