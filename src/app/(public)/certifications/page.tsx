import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  FileCheck2,
  Info,
  ShieldCheck,
  Star,
} from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { certificateRepository } from "@/features/certifications/repositories/certificate.repository";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Certifications & Standards",
  description:
    "Discover Virtuous Uniform's current registrations, quality foundation, and certification journey.",
};

const credentials = [
  {
    status: "Active Member",
    title: "Sialkot Chamber of Commerce & Industry",
    description:
      "Virtuous Uniform is a registered member of the Sialkot Chamber of Commerce & Industry, affirming our standing as a recognized manufacturer and exporter based in Sialkot's glove and leather goods industry cluster.",
    meta: "Membership details available on request",
    icon: Star,
    tone: "active",
  },
  {
    status: "Registered",
    title: "Business Registration & Trade License",
    description:
      "We operate as a formally registered business entity, licensed to manufacture and trade under applicable national and provincial regulations.",
    meta: "Registration details available on request",
    icon: ShieldCheck,
    tone: "active",
  },
  {
    status: "In Progress",
    title: "ISO 9001:2015",
    description:
      "We are actively working toward ISO 9001:2015 certification for our Quality Management System, aligning our processes with internationally recognized quality benchmarks.",
    meta: "Implementation underway",
    icon: Clock3,
    tone: "progress",
  },
] as const;

const qualityFoundations = [
  ["01", "Quality Management", "Organized quality practices and production monitoring help us achieve consistent results."],
  ["02", "Material Control", "Materials and components are carefully considered to support the required quality and performance of finished gloves."],
  ["03", "Process Control", "Production stages are monitored to maintain consistency, workmanship, and product quality."],
  ["04", "Product Inspection", "Finished products are inspected to identify defects and ensure they meet agreed specifications."],
  ["05", "Continuous Improvement", "We evaluate our processes and look for opportunities to improve efficiency, quality, and product performance."],
  ["06", "Customer Requirements", "We recognize the importance of customer specifications and work toward fulfilling agreed product requirements."],
] as const;

function isCurrent(expiryDate: Date | null) {
  return !expiryDate || expiryDate >= new Date();
}

export default async function CertificationsPage() {
  const certificates = await certificateRepository.findAll();

  return (
    <>
      <PageHero
        eyebrow="Certifications & Standards"
        title="Committed to Quality, Focused on Excellence."
        description="At Virtuous Uniform, we build every product on a foundation of accountability, traceability, and continuous quality improvement."
      />

      <main className="bg-background">
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium tracking-[0.16em] text-brand uppercase">Current standing</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Registrations & Credentials We Hold
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              These are verified, active credentials and clearly stated development work, not aspirational claims.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {credentials.map(({ icon: Icon, tone, ...credential }) => (
              <article
                key={credential.title}
                className="group flex flex-col rounded-xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/60 hover:shadow-lg"
              >
                <div className={`flex size-14 items-center justify-center rounded-full ${tone === "active" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="size-7" />
                </div>
                <span className={`mt-5 w-fit rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.12em] uppercase ${tone === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {credential.status}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{credential.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{credential.description}</p>
                <p className={`mt-6 border-t border-dashed border-border pt-4 text-xs ${tone === "active" ? "text-brand" : "text-muted-foreground"}`}>
                  {credential.meta}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.6fr_0.9fr] md:items-center sm:py-20">
            <div>
              <p className="text-sm font-medium tracking-[0.16em] text-brand uppercase">Our approach to standards</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                A practical foundation for reliable quality
              </h2>
              <div className="mt-6 space-y-4 leading-7 text-muted-foreground">
                <p>Quality and consistency are important parts of our manufacturing philosophy. We focus on controlled production processes, careful material selection, skilled workmanship, and inspection at different stages of manufacturing.</p>
                <p>We understand that international customers and markets may require specific product standards and certifications. For this reason, we are committed to continuously improving our processes and working toward the requirements of relevant industry standards.</p>
                <p>Our objective is to build a strong foundation for future certifications while maintaining reliable quality in the products we manufacture today.</p>
              </div>
            </div>
            <div className="rounded-xl bg-brand p-8 text-brand-foreground shadow-lg sm:p-10">
              <div className="flex size-14 items-center justify-center rounded-full bg-white text-brand"><Check className="size-7" /></div>
              <h3 className="mt-6 font-display text-2xl font-semibold">Quality Commitment</h3>
              <p className="mt-3 text-sm leading-7 text-brand-foreground/80">Our focus remains on continuous improvement, consistent manufacturing, and delivering products that meet agreed customer requirements.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium tracking-[0.16em] text-brand uppercase">Our quality foundation</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Built Around Consistent Standards</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Alongside our registrations, we believe in establishing strong manufacturing and quality practices across our operations.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {qualityFoundations.map(([number, title, description]) => (
              <article key={number} className="rounded-xl border border-border bg-card p-7 transition-colors hover:border-brand/60">
                <p className="font-display text-sm font-semibold tracking-wider text-brand">{number}</p>
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
          <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
            <p className="text-sm font-medium tracking-[0.16em] text-brand uppercase">Looking ahead</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Our Certification Journey</h2>
            <div className="mx-auto mt-5 max-w-3xl space-y-4 text-sm leading-7 text-primary-foreground/70 sm:text-base">
              <p>As Virtuous Uniform continues to develop, we are pursuing ISO 9001:2015 and other relevant industry certifications that support our commitment to quality and help us serve customers in different markets.</p>
              <p>Our approach is to prepare our systems and processes carefully so future certifications are supported by genuine and consistent manufacturing practices.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
          <div className="flex gap-4 rounded-xl border border-brand/30 bg-brand/5 p-6 sm:p-8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-brand text-brand"><Info className="size-5" /></div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Our Commitment to Transparency</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">We believe in being transparent about our current certification status. Our Sialkot Chamber of Commerce membership and business registration are active and verifiable today; ISO 9001 is genuinely in progress, not yet awarded. We do not claim certifications we do not hold.</p>
            </div>
          </div>
        </section>

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
