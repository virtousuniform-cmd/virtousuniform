import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  FileCheck2,
} from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { certificateRepository } from "@/features/certifications/repositories/certificate.repository";
import { contentPageRepository } from "@/features/cms/repositories/content-page.repository";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await contentPageRepository.findBySlug("certifications");
  return {
    title: page?.seoTitle || page?.title || "Certifications & Standards",
    description: page?.seoDescription || "Certifications and standards at Virtuous Uniform.",
  };
}

function isCurrent(expiryDate: Date | null) {
  return !expiryDate || expiryDate >= new Date();
}

export default async function CertificationsPage() {
  const [page, certificates] = await Promise.all([
    contentPageRepository.findBySlug("certifications"),
    certificateRepository.findAll(),
  ]);

  if (!page || page.status !== "PUBLISHED") {
    return <PageHero eyebrow="Certifications & Standards" title="Certifications & Standards" description="Our quality systems, registrations, and certification journey." />;
  }

  const cleanContent = page.content.replace(/^```html\n?/, "").replace(/\n?```$/, "");

  return (
    <>
      <main className="bg-background">
        <div dangerouslySetInnerHTML={{ __html: cleanContent }} />

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium tracking-[0.16em] text-brand uppercase">Document library</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">Published certificates</h2>
              <p className="mt-4 leading-7 text-muted-foreground">View the official documents currently available from our compliance team.</p>
            </div>
            {certificates.length === 0 ? (
              <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-dashed border-border bg-background px-6 py-12 text-center">
                <FileCheck2 className="mx-auto size-9 text-brand" />
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">Documents will be published here</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">For current product specifications, test reports, or buyer documentation, our team can provide the relevant information directly.</p>
              </div>
            ) : (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {certificates.map((certificate) => {
                  const current = isCurrent(certificate.expiryDate);
                  return (
                    <article key={certificate.id} className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted p-5">
                        <div className="relative h-full overflow-hidden rounded-md border border-border bg-background shadow-sm">
                          {certificate.thumbnail ? <Image src={certificate.thumbnail} alt={`${certificate.title} certificate`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><BadgeCheck className="size-10 text-brand" /></div>}
                        </div>
                        <span className="absolute top-8 right-8 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-success uppercase shadow-sm"><BadgeCheck className="size-3.5" /> {current ? "Current" : "Review required"}</span>
                      </div>
                      <div className="space-y-4 p-5">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-foreground">{certificate.title}</h3>
                          {certificate.issuer && <p className="mt-1 text-sm text-brand">Issued by {certificate.issuer}</p>}
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {certificate.issuedDate && <p className="flex items-center gap-2"><CalendarDays className="size-3.5" /> Issued {formatDate(certificate.issuedDate)}</p>}
                          {certificate.expiryDate && <p className="flex items-center gap-2"><CalendarDays className="size-3.5" /> Expires {formatDate(certificate.expiryDate)}</p>}
                        </div>
                        <a href={certificate.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-brand">View certificate <ArrowUpRight className="size-4" /></a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-medium text-brand">Need a specific document?</p><h2 className="mt-1 font-display text-2xl font-semibold text-foreground">Let&apos;s prepare the right compliance pack.</h2></div>
            <a href="/request-quote" className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">Request documentation <ArrowUpRight className="ml-2 size-4" /></a>
          </div>
        </section>
      </main>
    </>
  );
}
