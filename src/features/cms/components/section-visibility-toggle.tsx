"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSectionVisibilityAction } from "../actions/homepage-section.actions";
import type { HomepageSectionKey } from "@prisma/client";

export function SectionVisibilityToggle({
  sectionKey,
  isVisible,
}: {
  sectionKey: HomepageSectionKey;
  isVisible: boolean;
}) {
  const [visible, setVisible] = useState(isVisible);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !visible;
    setVisible(next);
    startTransition(async () => {
      const result = await toggleSectionVisibilityAction(sectionKey, next);
      if (!result.success) {
        toast.error(result.error);
        setVisible(!next);
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {visible ? (
        <>
          <Eye /> Visible
        </>
      ) : (
        <>
          <EyeOff /> Hidden
        </>
      )}
    </Button>
  );
}
