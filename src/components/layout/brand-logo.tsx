"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  logoUrl
}: {
  className?: string;
  logoUrl?: string;
}) {
  const [error, setError] = useState(false);

  // If no URL is provided, or an error occurred during loading, show the text-based logo.
  const showTextLogo = !logoUrl || error;

  return (
    <div className={cn("relative h-10 w-28", className)}>
      {!showTextLogo ? (
        <Image
          src={logoUrl!}
          alt="Virtuous Uniform"
          fill
          className="object-contain"
          priority
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-xs font-bold text-brand-foreground shrink-0">
            VU
          </span>
          <span className="font-display font-bold text-primary-foreground text-sm tracking-tight whitespace-nowrap">
            Virtuous<span className="text-brand">Uniform</span>
          </span>
        </div>
      )}
    </div>
  );
}
