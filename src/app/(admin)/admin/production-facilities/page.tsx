import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { productionFacilityRepository } from "@/features/production-facilities/repositories/production-facility.repository";
import { ProductionFacilityList } from "@/features/production-facilities/components/production-facility-list";

export const metadata: Metadata = { title: "Production Facilities — Admin" };

export default async function AdminProductionFacilitiesPage() {
  const facilities = await productionFacilityRepository.findAll();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Production Facilities
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the manufacturing process stages displayed on the homepage.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/production-facilities/new">
            <Plus className="mr-2 size-4" />
            Add Facility
          </Link>
        </Button>
      </div>

      <ProductionFacilityList facilities={facilities} />
    </div>
  );
}
