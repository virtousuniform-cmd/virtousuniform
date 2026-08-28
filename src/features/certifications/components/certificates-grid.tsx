"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FileText, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteCertificateAction } from "../actions/certificate.actions";
import { formatDate } from "@/lib/utils";

type Certificate = {
  id: string;
  title: string;
  issuer: string | null;
  fileUrl: string;
  thumbnail: string | null;
  issuedDate: Date | string | null;
  expiryDate: Date | string | null;
};

export function CertificatesGrid({ certificates }: { certificates: Certificate[] }) {
  const [items, setItems] = useState(certificates);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      const result = await deleteCertificateAction(id);
      if (result.success) {
        toast.success("Certificate deleted.");
        setItems((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((cert) => (
        <Card key={cert.id}>
          <CardContent className="flex gap-3">
            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {cert.thumbnail ? (
                <Image src={cert.thumbnail} alt={cert.title} fill className="object-cover" />
              ) : (
                <FileText className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-foreground">{cert.title}</p>
              {cert.issuer && <p className="text-xs text-muted-foreground">{cert.issuer}</p>}
              {cert.issuedDate && (
                <p className="text-xs text-muted-foreground">
                  Issued {formatDate(cert.issuedDate)}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={cert.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View file
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-6"
                  onClick={() => handleDelete(cert.id, cert.title)}
                  disabled={isPending}
                  aria-label="Delete certificate"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
