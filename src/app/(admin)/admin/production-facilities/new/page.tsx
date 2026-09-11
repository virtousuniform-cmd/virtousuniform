import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProductionFacilityForm } from "@/features/production-facilities/components/production-facility-form";

export const metadata: Metadata = { title: "Add Production Facility — Admin" };

export default function AddProductionFacilityPage() {
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
            Add Production Facility
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new production stage or process.
          </p>
        </div>
      </div>

      <ProductionFacilityForm />
    </div>
  );
}
