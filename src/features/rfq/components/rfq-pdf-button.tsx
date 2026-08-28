"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { RfqPdfTemplate } from "./rfq-pdf-template";

export function RfqPdfButton({ rfqId, refNo, customerName }: { rfqId: string; refNo: string; customerName: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      // In a real app, you might want to fetch full RFQ details here
      // if the table props don't have everything (like full items/specs).
      // For now, we'll assume we need to fetch the full RFQ detail.
      const response = await fetch(`/api/rfqs/${rfqId}/pdf-data`);
      if (!response.ok) throw new Error("Failed to fetch RFQ data");

      const rfqData = await response.json();

      const blob = await pdf(<RfqPdfTemplate rfq={rfqData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rfq-${refNo}-${customerName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF generated successfully.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-primary hover:bg-primary/10"
      disabled={isGenerating}
      onClick={(e) => {
        e.stopPropagation();
        handleDownload();
      }}
    >
      {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
      <span className="sr-only">Download PDF</span>
    </Button>
  );
}
