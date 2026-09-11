import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { productionFacilityRepository } from "@/features/production-facilities/repositories/production-facility.repository";
import { ProductionFacilityForm } from "@/features/production-facilities/components/production-facility-form";

export const metadata: Metadata = { title: "Edit Production Facility — Admin" };

export default async function EditProductionFacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const facility = await productionFacilityRepository.findById(id);

  if (!facility) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/production-facilities">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Edit Production Facility
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the details of "{facility.title}".
          </p>
        </div>
      </div>

      <ProductionFacilityForm facility={facility} />
    </div>
  );
}
