import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  CalendarDays,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { certificateRepository } from "@/features/certifications/repositories/certificate.repository";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Certifications & Compliance",
  description:
    "Explore the certifications and compliance documentation supporting Virtuous Uniform's professional glove manufacturing standards.",
};

function isCurrent(expiryDate: Date | null) {
  return !expiryDate || expiryDate >= new Date();
}

export default async function CertificationsPage() {
  const certificates = await certificateRepository.findAll();
  const issuerCount = new Set(certificates.map((certificate) => certificate.issuer).filter(Boolean)).size;
  const currentCount = certificates.filter((certificate) => isCurrent(certificate.expiryDate)).length;

  return (
    <>
      <PageHero
        eyebrow="Quality & Compliance"
        title="Proof Behind Every Pair"
        description="Our certifications and compliance documents give partners a clear view of the standards behind our products, processes, and export readiness."
      />

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <div className="flex size-11 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Standards made visible
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              We are building our certification portfolio deliberately as the company grows. Each
              document is presented with its issuing body and validity details so buyers can review
              the evidence with confidence.
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-background py-5">
            <div className="px-4 text-center">
              <p className="font-display text-2xl font-semibold text-foreground">{certificates.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Documents</p>
            </div>
            <div className="px-4 text-center">
              <p className="font-display text-2xl font-semibold text-foreground">{issuerCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Issuers</p>
            </div>
            <div className="px-4 text-center">
              <p className="font-display text-2xl font-semibold text-foreground">{currentCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Current</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand uppercase">Document library</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Certifications on file
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-right">
            Select a certificate to view the original document or share it with your compliance team.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="mt-10 grid gap-8 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center md:grid-cols-[auto_1fr] md:items-center md:px-16 md:text-left">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand/15 text-brand md:mx-0">
              <FileCheck2 className="size-8" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Our certification library is being established
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:mx-0">
                We are preparing the first official documents for publication. For current product
                specifications, test reports, or buyer documentation, our team can provide the
                relevant information directly.
              </p>
              <a
                href="/contact"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                Contact our compliance team <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => {
              const current = isCurrent(certificate.expiryDate);
              return (
                <article
                  key={certificate.id}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted p-5">
                    <div className="relative h-full overflow-hidden rounded-md border border-border bg-background shadow-sm">
                      {certificate.thumbnail ? (
                        <Image
                          src={certificate.thumbnail}
                          alt={`${certificate.title} certificate`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(135deg,transparent_25%,rgba(120,120,120,0.05)_25%,rgba(120,120,120,0.05)_50%,transparent_50%,transparent_75%,rgba(120,120,120,0.05)_75%)] bg-[length:18px_18px] px-6 text-center">
                          <Award className="size-10 text-brand" />
                          <p className="mt-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Official document
                          </p>
                        </div>
                      )}
                    </div>
                    <span className="absolute top-8 right-8 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-success uppercase shadow-sm">
                      <BadgeCheck className="size-3.5" /> {current ? "Current" : "Review required"}
                    </span>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{certificate.title}</h3>
                      {certificate.issuer && (
                        <p className="mt-1 text-sm text-brand">Issued by {certificate.issuer}</p>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      {certificate.issuedDate && (
                        <p className="flex items-center gap-2">
                          <CalendarDays className="size-3.5" /> Issued {formatDate(certificate.issuedDate)}
                        </p>
                      )}
                      {certificate.expiryDate && (
                        <p className="flex items-center gap-2">
                          <CalendarDays className="size-3.5" /> Expires {formatDate(certificate.expiryDate)}
                        </p>
                      )}
                    </div>

                    <a
                      href={certificate.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-brand"
                    >
                      View certificate <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand">Need a specific document?</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
              Let&apos;s prepare the right compliance pack.
            </h2>
          </div>
          <a
            href="/request-quote"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Request documentation <ArrowUpRight className="ml-2 size-4" />
          </a>
        </div>
      </section>
    </>
  );
}