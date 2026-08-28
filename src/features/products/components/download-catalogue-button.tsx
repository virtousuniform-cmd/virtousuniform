"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { CataloguePdfTemplate } from "./catalogue-pdf-template";

export function DownloadCatalogueButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/products/catalogue-data");
      if (!response.ok) throw new Error("Failed to fetch catalogue data");

      const products = await response.json();

      const blob = await pdf(<CataloguePdfTemplate products={products} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "gloves-catalogue-2026.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Catalogue generated successfully.");
    } catch (err) {
      console.error("Catalogue generation failed:", err);
      toast.error("Failed to generate catalogue.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button
      variant="brand"
      className="gap-2"
      disabled={isGenerating}
      onClick={handleDownload}
    >
      {isGenerating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Download Catalogue
    </Button>
  );
}
