"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { rfqFormSchema, type RfqFormValues } from "../schemas/rfq.schema";
import { createRfqAction } from "../actions/create-rfq.action";

type ProductOption = { id: string; name: string };

export function RfqForm({
  products,
  preselectedProductId,
}: {
  products: ProductOption[];
  preselectedProductId?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedRefNo, setSubmittedRefNo] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RfqFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      preferredContactMethod: "EMAIL",
      items: [{ productId: preselectedProductId, quantity: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(values: RfqFormValues) {
    setSubmitting(true);
    const result = await createRfqAction(values);
    setSubmitting(false);

    if (result.success) {
      setSubmittedRefNo(result.refNo);
    } else {
      toast.error(result.error);
    }
  }

  if (submittedRefNo) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <CheckCircle2 className="size-10 text-success" />
          <h2 className="text-xl font-semibold text-foreground">Request submitted</h2>
          <p className="text-muted-foreground">
            Your reference number is <strong className="text-foreground">{submittedRefNo}</strong>.
            Our team will review your request and respond by email shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Honeypot — hidden from real users, bots tend to fill every field. */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company &amp; contact details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" error={errors.companyName?.message}>
            <Input {...register("companyName")} />
          </Field>
          <Field label="Contact name" error={errors.contactName?.message}>
            <Input {...register("contactName")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input type="tel" {...register("phone")} />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Input {...register("country")} />
          </Field>
          <Field label="Estimated total quantity" error={errors.quantity?.message}>
            <Input {...register("quantity")} placeholder="e.g. 50,000 pairs" />
          </Field>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Preferred contact method</Label>
            <Select
              value={watch("preferredContactMethod")}
              onValueChange={(v) =>
                setValue("preferredContactMethod", v as RfqFormValues["preferredContactMethod"])
              }
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="PHONE">Phone</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.items?.message && (
            <p className="text-xs text-destructive">{errors.items.message}</p>
          )}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_140px_auto]"
            >
              <div className="space-y-1.5">
                <Label>Product</Label>
                <Select
                  value={watch(`items.${index}.productId`)}
                  onValueChange={(v) => setValue(`items.${index}.productId`, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input {...register(`items.${index}.quantity`)} placeholder="e.g. 10,000" />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  aria-label="Remove item"
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ quantity: "" })}
          >
            <Plus /> Add another product
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            {...register("requirements")}
            placeholder="Certifications required, custom packaging, delivery timeline, etc."
          />
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Submitting…" : "Submit Request for Quotation"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
