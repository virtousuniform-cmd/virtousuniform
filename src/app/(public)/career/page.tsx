import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join our team — current openings at our manufacturing facility.",
};

export default async function CareerPage() {
  const openings = await prisma.career.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Join Our Team"
        description="We're always looking for skilled people to join our manufacturing and export operations."
      />

      <div className="mx-auto max-w-3xl px-6 py-16">
        {openings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">
              No open positions right now — check back soon, or{" "}
              <Link href="/contact" className="text-primary hover:underline">
                send us your resume
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {openings.map((job) => (
              <div key={job.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground">{job.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[job.department, job.location, job.employmentType]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {job.employmentType && <Badge variant="outline">{job.employmentType}</Badge>}
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
