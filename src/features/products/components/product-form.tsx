"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import slugify from "slugify";
import { Save } from "lucide-react";

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

import {
  productFormSchema,
  type ProductFormValues,
} from "../schemas/product.schema";
import { createProductAction, updateProductAction } from "../actions/product.actions";

type Category = { id: string; name: string };

export function ProductForm({
  categories,
  defaultValues,
  productId,
}: {
  categories: Category[];
  defaultValues?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!productId;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      status: "DRAFT",
      stockStatus: "IN_STOCK",
      isFeatured: false,
      color: [],
      sizes: [],
      specifications: [],
      seoKeywords: [],
      ...defaultValues,
    },
  });

  // Color/size are stored as string arrays (see product.schema.ts), but the
  // simplest input for an admin is a comma-separated text field. Keep local
  // text state in sync with the array field rather than trying to edit the
  // array directly on every keystroke.
  const [colorText, setColorText] = useState((defaultValues?.color ?? []).join(", "));
  const [sizeText, setSizeText] = useState((defaultValues?.sizes ?? []).join(", "));

  function syncArrayField(field: "color" | "sizes", text: string) {
    const values = text
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    setValue(field, values, { shouldValidate: true });
  }

  const name = watch("name");

  function handleNameBlur() {
    if (!watch("slug") && name) {
      setValue("slug", slugify(name, { lower: true, strict: true }));
    }
  }

  async function onSubmit(values: ProductFormValues) {
    setSubmitting(true);
    const result = isEditing
      ? await updateProductAction(productId!, values)
      : await createProductAction(values);
    setSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Product updated." : "Product created.");
      router.push(`/admin/products/${result.data.id}`);
      router.refresh();
    } else {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof ProductFormValues, {
            type: "server",
            message: messages[0],
          });
        });
      }
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" {...register("name")} onBlur={handleNameBlur} />
            {errors.name && <FieldError message={errors.name.message} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} />
            {errors.slug && <FieldError message={errors.slug.message} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} />
            {errors.sku && <FieldError message={errors.sku.message} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modelNumber">Model number</Label>
            <Input id="modelNumber" {...register("modelNumber")} />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={watch("categoryId") || undefined}
              onValueChange={(v) => setValue("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as ProductFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Textarea id="shortDescription" rows={2} {...register("shortDescription")} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="longDescription">Full description</Label>
            <Textarea id="longDescription" rows={6} {...register("longDescription")} />
            <p className="text-xs text-muted-foreground">
              Rich-text editing (Tiptap) lands in the next pass — plain text for now.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="material">Material</Label>
            <Input id="material" {...register("material")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="application">Application</Label>
            <Input id="application" {...register("application")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="color">Color(s)</Label>
            <Input
              id="color"
              value={colorText}
              placeholder="e.g. Blue, White, Black"
              onChange={(e) => {
                setColorText(e.target.value);
                syncArrayField("color", e.target.value);
              }}
            />
            <p className="text-xs text-muted-foreground">Comma-separated.</p>
            {errors.color && <FieldError message={errors.color.message as string} />}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sizes">Size(s)</Label>
            <Input
              id="sizes"
              value={sizeText}
              placeholder="e.g. S, M, L, XL"
              onChange={(e) => {
                setSizeText(e.target.value);
                syncArrayField("sizes", e.target.value);
              }}
            />
            <p className="text-xs text-muted-foreground">Comma-separated.</p>
            {errors.sizes && <FieldError message={errors.sizes.message as string} />}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="moq">MOQ</Label>
            <Input id="moq" {...register("moq")} placeholder="e.g. 5,000 pairs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="packaging">Packaging</Label>
            <Input id="packaging" {...register("packaging")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weight">Weight</Label>
            <Input id="weight" {...register("weight")} placeholder="e.g. 45g per pair" />
          </div>
          <div className="space-y-1.5">
            <Label>Stock status</Label>
            <Select
              value={watch("stockStatus")}
              onValueChange={(v) =>
                setValue("stockStatus", v as ProductFormValues["stockStatus"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">In stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of stock</SelectItem>
                <SelectItem value="MADE_TO_ORDER">Made to order</SelectItem>
                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle">Meta title</Label>
            <Input id="seoTitle" {...register("seoTitle")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoDescription">Meta description</Label>
            <Input id="seoDescription" {...register("seoDescription")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save /> {isEditing ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}
