"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative h-10 w-24 overflow-hidden", className)}>
      {!error ? (
        <Image
          src="/images/logo.png"
          alt="Virtuous Uniform"
          fill
          className="object-contain"
          priority
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-foreground">
            VU
          </span>
          <span className="font-display font-semibold text-primary-foreground">
            Virtuous<span className="text-brand">Uniform</span>
          </span>
        </div>
      )}
    </div>
  );
}
