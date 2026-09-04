"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  const nextSlide = useCallback(() => {
    setDirection(1);
    setIndex((prev) => {
      const next = (prev + 1) % images.length;
      onIndexChange?.(next);
      return next;
    });
  }, [images.length, onIndexChange]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(nextSlide, 6000); // 6 seconds for a professional, slower pace
    return () => clearInterval(timer);
  }, [images.length, nextSlide]);

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl" />
    );
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.1,
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
      scale: 0.9,
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
          <Image
            src={images[index] || ""}
            alt={`Hero Background ${index + 1}`}
            fill
            priority
            className="object-cover object-center"
          />
          {/* Professional Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
