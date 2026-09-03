import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a human-readable RFQ reference number, e.g. RFQ-2026-000123. */
export function generateRfqRefNo(sequence: number) {
  const year = new Date().getFullYear();
  return `RFQ-${year}-${String(sequence).padStart(6, "0")}`;
}

/** Format a date consistently across the app (server + client safe). */
export function formatDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(d);
}

/** Truncate text to a max length, respecting word boundaries. */
export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, text.lastIndexOf(" ", maxLength)) + "…";
}
