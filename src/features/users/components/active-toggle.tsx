"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleUserActiveAction } from "../actions/user.actions";

export function ActiveToggle({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const result = await toggleUserActiveAction(userId, next);
      if (!result.success) {
        toast.error(result.error);
        setActive(!next);
      } else {
        toast.success(next ? "Account activated." : "Account deactivated.");
      }
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={isPending}>
      {active ? (
        <>
          <CheckCircle2 className="text-success" /> Active
        </>
      ) : (
        <>
          <Ban className="text-destructive" /> Inactive
        </>
      )}
    </Button>
  );
}
