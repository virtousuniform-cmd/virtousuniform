"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testimonialFormSchema, type TestimonialFormValues } from "../schemas/testimonial.schema";
import { createTestimonialAction } from "../actions/testimonial.actions";

export function AddTestimonialForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: { rating: 5, isApproved: true, isFeatured: false },
  });

  async function onSubmit(values: TestimonialFormValues) {
    setSubmitting(true);
    const result = await createTestimonialAction(values);
    setSubmitting(false);

    if (result.success) {
      toast.success("Testimonial added.");
      reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add testimonial</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Customer name</Label>
            <Input id="customerName" {...register("customerName")} />
            {errors.customerName && (
              <p className="text-xs text-destructive">{errors.customerName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company</Label>
            <Input id="companyName" {...register("companyName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input id="rating" type="number" min={1} max={5} {...register("rating")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="review">Review</Label>
            <Textarea id="review" rows={3} {...register("review")} />
            {errors.review && (
              <p className="text-xs text-destructive">{errors.review.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              <Plus /> Add testimonial
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
