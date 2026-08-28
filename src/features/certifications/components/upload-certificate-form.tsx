"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadCertificateAction } from "../actions/certificate.actions";

export function UploadCertificateForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await uploadCertificateAction(formData);
    setSubmitting(false);

    if (result.success) {
      toast.success("Certificate uploaded.");
      formRef.current?.reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload certificate</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issuer">Issuer</Label>
            <Input id="issuer" name="issuer" placeholder="e.g. SGS, Intertek" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issuedDate">Issued date</Label>
            <Input id="issuedDate" name="issuedDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiryDate">Expiry date</Label>
            <Input id="expiryDate" name="expiryDate" type="date" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="file">File (PDF, WEBP, JPEG, or PNG)</Label>
            <Input id="file" name="file" type="file" accept=".pdf,image/webp,image/jpeg,image/png" required />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              <Upload /> {submitting ? "Uploading…" : "Upload certificate"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
