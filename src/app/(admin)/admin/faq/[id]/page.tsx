import { notFound } from "next/navigation";
import { faqRepository } from "@/features/cms/repositories/faq.repository";
import { FaqForm } from "@/features/cms/components/faq-form";

export default async function EditAdminFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faq = await faqRepository.findById(id);

  if (!faq) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <FaqForm id={faq.id} initialData={faq as any} />
    </div>
  );
}
