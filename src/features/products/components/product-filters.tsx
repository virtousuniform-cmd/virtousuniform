"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

export function ProductFilters({
  categories,
  currentCategoryId,
  currentSearch,
}: {
  categories: Category[];
  currentCategoryId?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch || "");

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchValue(currentSearch || "");
  }, [currentSearch]);

  function handleFilter(params: Record<string, string | null>) {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // Reset to page 1 on filter change
    newParams.delete("page");

    startTransition(() => {
      router.push(`/products?${newParams.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="border-b border-border bg-card py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={!currentCategoryId}
              label="All Products"
              onClick={() => handleFilter({ categoryId: null })}
              disabled={isPending}
            />
            {categories.map((c) => (
              <FilterPill
                key={c.id}
                active={currentCategoryId === c.id}
                label={c.name}
                onClick={() => handleFilter({ categoryId: c.id })}
                disabled={isPending}
              />
            ))}
          </div>

          <div className="relative w-full max-w-sm">
            <Search className={cn(
              "absolute top-1/2 left-3 size-4 -translate-y-1/2 transition-colors",
              isPending ? "text-brand animate-pulse" : "text-muted-foreground"
            )} />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFilter({ search: searchValue || null });
                }
              }}
              placeholder="Search products..."
              className={cn("pl-9 pr-9", isPending && "opacity-70")}
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  handleFilter({ search: null });
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
        active
          ? "border-brand bg-brand text-brand-foreground shadow-sm shadow-brand/20"
          : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}
