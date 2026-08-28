"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSectionContentAction } from "../../actions/homepage-section.actions";

type StatItem = { label: string; value: number };
type StatisticsContent = { items: StatItem[] };

export function StatisticsSectionEditor({ content }: { content: StatisticsContent }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, control, handleSubmit } = useForm<StatisticsContent>({
    defaultValues: content,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(values: StatisticsContent) {
    setSubmitting(true);
    const result = await updateSectionContentAction("STATISTICS", values);
    setSubmitting(false);
    if (result.success) toast.success("Statistics updated.");
    else toast.error(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-[1fr_140px_auto] gap-2">
          <div className="space-y-1.5">
            {index === 0 && <Label>Label</Label>}
            <Input {...register(`items.${index}.label`)} />
          </div>
          <div className="space-y-1.5">
            {index === 0 && <Label>Value</Label>}
            <Input type="number" {...register(`items.${index}.value`, { valueAsNumber: true })} />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label="Remove stat"
            >
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ label: "", value: 0 })}>
        <Plus /> Add stat
      </Button>
      <div>
        <Button type="submit" disabled={submitting}>
          <Save /> Save changes
        </Button>
      </div>
    </form>
  );
}
