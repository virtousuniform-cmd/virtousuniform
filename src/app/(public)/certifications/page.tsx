import Image from "next/image";
import type { Metadata } from "next";
import { FileText, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/shared/page-hero";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Certifications",
  description: "ISO, CE, and product-specific certifications backing every shipment.",
};

export default async function CertificationsPage() {
  const certificates = await prisma.certificate.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageHero
        eyebrow="Certifications"
        title="Quality You Can Verify"
        description="Every certification backing our manufacturing and export operations, available to download."
      />

      <div className="mx-auto max-w-5xl px-6 py-16">
        {certificates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-24 text-center">
            <p className="text-muted-foreground">No certifications published yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <a
                key={cert.id}
                href={cert.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:shadow-md"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center bg-muted">
                  {cert.thumbnail ? (
                    <Image src={cert.thumbnail} alt={cert.title} fill className="object-cover" />
                  ) : (
                    <FileText className="size-10 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="font-medium text-foreground group-hover:text-primary">
                    {cert.title}
                  </h3>
                  {cert.issuer && (
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  )}
                  {cert.issuedDate && (
                    <p className="text-xs text-muted-foreground">
                      Issued {formatDate(cert.issuedDate)}
                    </p>
                  )}
                  <div className="flex items-center gap-1 pt-1 text-xs text-primary">
                    <Download className="size-3.5" /> Download
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
