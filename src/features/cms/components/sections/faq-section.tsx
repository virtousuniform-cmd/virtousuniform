import { prisma } from "@/lib/prisma";

export async function FaqSection({ showHeading = true }: { showHeading?: boolean } = {}) {
  const faqs = await prisma.faqItem.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      {showHeading && (
        <div className="mb-10 text-center">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">FAQ</p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>
      )}

      <dl className="divide-y divide-border">
        {faqs.map((faq) => (
          <div key={faq.id} className="py-5">
            <dt className="font-medium text-foreground">{faq.question}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
