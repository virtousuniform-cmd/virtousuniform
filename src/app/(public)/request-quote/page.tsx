import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RfqForm } from "@/features/rfq/components/rfq-form";

export const metadata: Metadata = {
  title: "Request a Quotation",
  description:
    "Submit a request for quotation and our export team will respond with pricing, lead times, and MOQ details.",
};

export default async function RequestQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productSlug } = await searchParams;

  const [products, preselected] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    productSlug
      ? prisma.product.findFirst({ where: { slug: productSlug }, select: { id: true } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          Request for Quotation
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Get a Custom Quote
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tell us what you need and our export team will respond with pricing, lead
          times, and minimum order quantities — typically within one business day.
        </p>
      </div>

      <RfqForm products={products} preselectedProductId={preselected?.id} />
    </div>
  );
}
