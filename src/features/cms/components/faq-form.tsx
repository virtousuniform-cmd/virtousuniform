"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFaqAction, updateFaqAction } from "../actions/faq.actions";

const faqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(10),
  category: z.string().max(100).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isVisible: z.boolean().default(true),
});

type FaqFormValues = z.infer<typeof faqSchema>;

export function FaqForm({ initialData, id }: { initialData?: Partial<FaqFormValues>; id?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: { isVisible: true, sortOrder: 0, ...initialData },
  });

  async function onSubmit(values: FaqFormValues) {
    setSubmitting(true);
    const result = isEditing
      ? await updateFaqAction(id!, values as any)
      : await createFaqAction(values as any);
    setSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "FAQ updated." : "FAQ created.");
      router.push("/admin/faq");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {isEditing ? "Edit FAQ" : "New FAQ"}
        </h1>
        <Button type="submit" disabled={submitting}>
          <Save className="mr-2 size-4" /> {isEditing ? "Save changes" : "Add FAQ"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="question">Question</Label>
            <Input id="question" {...register("question")} placeholder="e.g. What is your MOQ?" />
            {errors.question && <p className="text-xs text-destructive">{errors.question.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="answer">Answer</Label>
            <Textarea id="answer" rows={6} {...register("answer")} placeholder="Detailed answer..." />
            {errors.answer && <p className="text-xs text-destructive">{errors.answer.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input id="category" {...register("category")} placeholder="e.g. Shipping, Quality" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" type="number" {...register("sortOrder")} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isVisible"
              type="checkbox"
              className="size-4 rounded border-input"
              {...register("isVisible")}
            />
            <Label htmlFor="isVisible" className="font-normal">
              Visible on the public site
            </Label>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
