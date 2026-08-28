"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updateUserRoleAction } from "../actions/user.actions";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  CUSTOMER: "Customer",
};

export function RoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(role: string) {
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, role);
      if (result.success) {
        toast.success(`Role updated to ${ROLE_LABELS[role]}.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Select defaultValue={currentRole} onValueChange={handleChange} disabled={isPending || disabled}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ROLE_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
