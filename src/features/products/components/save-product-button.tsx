"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleSavedProductAction } from "../actions/saved-product.actions";

export function SaveProductButton({
  productId,
  initialSaved,
}: {
  productId: string;
  initialSaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const result = await toggleSavedProductAction(productId);
      if (!result.success) {
        setSaved(!next);
        if (result.requiresAuth) {
          toast.error(result.error, {
            action: { label: "Sign in", onClick: () => router.push("/login") },
          });
        } else {
          toast.error(result.error);
        }
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
    >
      <Heart className={cn("size-4", saved && "fill-destructive text-destructive")} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
