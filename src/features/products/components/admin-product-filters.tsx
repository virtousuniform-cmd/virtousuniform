"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: string; name: string };

export function AdminProductFilters({
  categories,
  currentCategoryId
}: {
  categories: Category[];
  currentCategoryId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleCategoryChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("categoryId");
    } else {
      params.set("categoryId", value);
    }
    params.delete("page"); // Reset to first page
    router.push(`/admin/products?${params.toString()}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="size-4 text-muted-foreground" />
      <Select
        defaultValue={currentCategoryId || "all"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
