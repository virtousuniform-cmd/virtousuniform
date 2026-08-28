"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Star, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  setTestimonialApprovalAction,
  setTestimonialFeaturedAction,
  deleteTestimonialAction,
} from "../actions/testimonial.actions";

type TestimonialRow = {
  id: string;
  customerName: string;
  companyName: string | null;
  country: string | null;
  rating: number;
  review: string;
  isApproved: boolean;
  isFeatured: boolean;
};

export function TestimonialsTable({ testimonials }: { testimonials: TestimonialRow[] }) {
  const [rows, setRows] = useState(testimonials);
  const [isPending, startTransition] = useTransition();

  function handleApproval(id: string, approve: boolean) {
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, isApproved: approve } : t)));
    startTransition(async () => {
      const result = await setTestimonialApprovalAction(id, approve);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleFeatured(id: string, featured: boolean) {
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, isFeatured: featured } : t)));
    startTransition(async () => {
      const result = await setTestimonialFeaturedAction(id, featured);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteTestimonialAction(id);
      if (result.success) {
        toast.success("Testimonial deleted.");
        setRows((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-center">Approved</TableHead>
            <TableHead className="text-center">Featured</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <p className="font-medium text-foreground">{t.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {[t.companyName, t.country].filter(Boolean).join(" · ")}
                </p>
              </TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {t.review}
              </TableCell>
              <TableCell>
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => handleApproval(t.id, !t.isApproved)}
                  disabled={isPending}
                  aria-label={t.isApproved ? "Unapprove" : "Approve"}
                >
                  {t.isApproved ? (
                    <CheckCircle2 className="mx-auto size-4 text-success" />
                  ) : (
                    <XCircle className="mx-auto size-4 text-muted-foreground" />
                  )}
                </button>
              </TableCell>
              <TableCell className="text-center">
                <button
                  onClick={() => handleFeatured(t.id, !t.isFeatured)}
                  disabled={isPending}
                  aria-label={t.isFeatured ? "Unfeature" : "Feature"}
                >
                  <Star
                    className={cn(
                      "mx-auto size-4",
                      t.isFeatured ? "fill-warning text-warning" : "text-muted-foreground",
                    )}
                  />
                </button>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(t.id, t.customerName)}
                  disabled={isPending}
                  aria-label="Delete testimonial"
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length > 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
                {rows.filter((r) => !r.isApproved).length} pending approval
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
