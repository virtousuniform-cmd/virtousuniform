import { notFound } from "next/navigation";
import { contentPageRepository } from "@/features/cms/repositories/content-page.repository";
import { ContentPageForm } from "@/features/cms/components/content-page-form";

export default async function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await contentPageRepository.findById(id);

  if (!page) notFound();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <ContentPageForm id={page.id} initialData={page as any} />
    </div>
  );
}
