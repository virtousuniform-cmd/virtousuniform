"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateContactInfoAction } from "../actions/settings.actions";
import type { ContactInfoSetting } from "../repositories/settings.repository";

export function ContactInfoForm({ defaultValues }: { defaultValues: ContactInfoSetting }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<ContactInfoSetting>({ defaultValues });

  async function onSubmit(values: ContactInfoSetting) {
    setSubmitting(true);
    const result = await updateContactInfoAction(values);
    setSubmitting(false);
    if (result.success) toast.success("Contact info updated — reflected across the site.");
    else toast.error(result.error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Sales email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Factory address</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              <Save /> Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
