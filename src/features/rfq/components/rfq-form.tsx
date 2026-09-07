"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2, Loader2, Filter } from "lucide-react";

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

type ProductOption = { id: string; name: string; categoryId: string | null };
type CategoryOption = { id: string; name: string };

export function RfqForm({
  products,
  categories,
  preselectedProductId,
  preselectedCategoryId,
}: {
  products: ProductOption[];
  categories: CategoryOption[];
  preselectedProductId?: string;
  preselectedCategoryId?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedRefNo, setSubmittedRefNo] = useState<string | null>(null);

  // Keep track of category filter per item index
  const [itemCategories, setItemCategories] = useState<Record<number, string>>(
    preselectedCategoryId ? { 0: preselectedCategoryId } : {}
  );

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
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await createRfqAction(values);
      if (result.success) {
        setSubmittedRefNo(result.refNo);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("A network error occurred. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedRefNo) {
    return (
      <Card className="mx-auto max-w-lg text-center shadow-2xl border-brand/20">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Request Received Successfully</h2>
            <p className="text-muted-foreground">
              Your reference number is <strong className="text-brand font-mono">{submittedRefNo}</strong>
            </p>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Our export team has been notified. You will receive a confirmation email shortly with the next steps.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Company & Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <Field label="Company Name" error={errors.companyName?.message}>
            <Input {...register("companyName")} placeholder="e.g. Global Trade Co." />
          </Field>
          <Field label="Contact Name" error={errors.contactName?.message}>
            <Input {...register("contactName")} placeholder="e.g. John Smith" />
          </Field>
          <Field label="Business Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} placeholder="john@company.com" />
          </Field>
          <Field label="Phone Number" error={errors.phone?.message}>
            <Input type="tel" {...register("phone")} placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Input {...register("country")} placeholder="e.g. United Kingdom" />
          </Field>
          <Field label="Estimated Total Quantity" error={errors.quantity?.message}>
            <Input {...register("quantity")} placeholder="e.g. 20,000 units" />
          </Field>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Preferred Contact Method</Label>
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
                <SelectItem value="PHONE">Phone Call</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Requested Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.items?.message && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <Plus className="size-4 rotate-45" />
              {errors.items.message}
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => {
              const selectedCategoryId = itemCategories[index] || "all";
              const filteredProducts = selectedCategoryId === "all"
                ? products
                : products.filter(p => p.categoryId === selectedCategoryId);

              return (
                <div
                  key={field.id}
                  className="relative grid gap-4 rounded-xl border border-border bg-muted/20 p-5 pt-10 sm:grid-cols-[200px_1fr_120px] sm:pt-5"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:hidden"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Filter className="size-3" /> Filter Category
                    </Label>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={(v) => {
                        setItemCategories(prev => ({ ...prev, [index]: v }));
                        // Clear selected product if it's not in the new category
                        const currentProduct = watch(`items.${index}.productId`);
                        if (currentProduct && v !== "all") {
                          const p = products.find(p => p.id === currentProduct);
                          if (p?.categoryId !== v) {
                            setValue(`items.${index}.productId`, "");
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="bg-background">
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

                  <div className="space-y-1.5">
                    <Label>Product Name</Label>
                    <Select
                      value={watch(`items.${index}.productId`)}
                      onValueChange={(v) => setValue(`items.${index}.productId`, v)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.length === 0 ? (
                          <div className="p-2 text-center text-xs text-muted-foreground">
                            No products in this category
                          </div>
                        ) : (
                          filteredProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input
                      {...register(`items.${index}.quantity`)}
                      placeholder="Qty"
                      className="bg-background"
                    />
                  </div>

                  <div className="hidden items-end pb-0.5 sm:flex">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed py-6 hover:bg-brand/5 hover:text-brand hover:border-brand/50"
            onClick={() => append({ productId: "", quantity: "" })}
          >
            <Plus className="mr-2 size-4" /> Add Another Product to Quotation
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Detailed Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            {...register("requirements")}
            placeholder="Please specify any technical requirements, certifications, custom branding/packaging needs, or delivery timelines."
            className="resize-none"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-14 min-w-[280px] bg-brand text-brand-foreground hover:bg-brand/90 shadow-xl shadow-brand/20 text-lg"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Processing Request...
            </>
          ) : (
            "Submit Quotation Request"
          )}
        </Button>
        {submitting && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Connecting to manufacturing server...
          </p>
        )}
      </div>
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
