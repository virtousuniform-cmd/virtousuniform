"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Edit2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  deleteProductionFacilityAction,
  reorderProductionFacilitiesAction,
  updateProductionFacilityAction,
} from "../actions/production-facility.actions";
import type { ProductionFacility } from "@prisma/client";

export function ProductionFacilityList({
  facilities: initialFacilities,
}: {
  facilities: ProductionFacility[];
}) {
  const [facilities, setFacilities] = useState(initialFacilities);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDragStart(id: string) {
    setIsDragging(id);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(targetId: string) {
    if (!isDragging || isDragging === targetId) {
      setIsDragging(null);
      return;
    }

    const draggedIndex = facilities.findIndex((f) => f.id === isDragging);
    const targetIndex = facilities.findIndex((f) => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setIsDragging(null);
      return;
    }

    const newFacilities = [...facilities];
    const [draggedItem] = newFacilities.splice(draggedIndex, 1);
    
    if (!draggedItem) {
      setIsDragging(null);
      return;
    }

    newFacilities.splice(targetIndex, 0, draggedItem);

    // Update display order
    const reordered = newFacilities.map((f, i) => ({
      ...f,
      displayOrder: i,
    }));

    setFacilities(reordered);
    setIsDragging(null);

    startTransition(async () => {
      const result = await reorderProductionFacilitiesAction(
        reordered.map((f) => ({ id: f.id, displayOrder: f.displayOrder }))
      );
      if (!result.success) {
        toast.error(result.error);
        setFacilities(initialFacilities);
      }
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;

    startTransition(async () => {
      const result = await deleteProductionFacilityAction(id);
      if (result.success) {
        setFacilities((prev) => prev.filter((f) => f.id !== id));
        toast.success("Facility deleted.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleToggleActive(facility: ProductionFacility) {
    startTransition(async () => {
      const result = await updateProductionFacilityAction(facility.id, {
        ...facility,
        isActive: !facility.isActive,
      });

      if (result.success) {
        setFacilities((prev) =>
          prev.map((f) =>
            f.id === facility.id ? { ...f, isActive: !f.isActive } : f
          )
        );
        toast.success(
          facility.isActive ? "Facility hidden." : "Facility shown."
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Facilities ({facilities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {facilities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No facilities yet. Create one to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                draggable
                onDragStart={() => handleDragStart(facility.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(facility.id)}
                className={`flex gap-3 rounded-lg border p-3 transition-all ${
                  isDragging === facility.id
                    ? "bg-primary/10 border-primary/50"
                    : "border-border hover:bg-muted/50"
                } ${!facility.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-center text-muted-foreground">
                  <GripVertical className="size-4" />
                </div>

                <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border">
                  <Image
                    src={facility.imageUrl}
                    alt={facility.imageAlt || facility.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">
                    {facility.title}
                  </p>
                  {facility.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {facility.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Order: {facility.displayOrder}
                    </Badge>
                    {!facility.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Hidden
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(facility)}
                    disabled={isPending}
                    title={facility.isActive ? "Hide" : "Show"}
                  >
                    {facility.isActive ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <Link href={`/admin/production-facilities/${facility.id}`}>
                      <Edit2 className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(facility.id, facility.title)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
