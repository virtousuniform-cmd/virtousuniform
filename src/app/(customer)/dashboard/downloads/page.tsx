import { headers } from "next/headers";
import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { savedProductRepository } from "@/features/products/repositories/saved-product.repository";

export const metadata: Metadata = { title: "Downloads" };

export default async function DownloadsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const saved = await savedProductRepository.findByUser(session!.user.id);
  const downloads = saved.filter((s) => s.product.brochurePdf);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Downloads</h1>
        <p className="text-sm text-muted-foreground">
          Brochures for products you&apos;ve saved.
        </p>
      </div>

      {downloads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <Download className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No brochures available yet — save a product with a downloadable brochure to see
            it here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {downloads.map(({ product }) => (
            <a
              key={product.id}
              href={product.brochurePdf!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50"
            >
              <FileText className="size-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">Product brochure (PDF)</p>
              </div>
              <Download className="size-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
