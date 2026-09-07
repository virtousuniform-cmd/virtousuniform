"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { processSingleBatchProductAction, finishBatchAction } from "../actions/batch-product.actions";
import { createCategoryAction } from "@/features/categories/actions/category.actions";
import slugify from "slugify";

type Category = { id: string; name: string };

type UploadItem = {
  file: File;
  status: "IDLE" | "PROCESSING" | "SUCCESS" | "ERROR";
  error?: string;
};

export function BatchUploadForm({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categoryId, setCategoryId] = useState<string>("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // New category state
  const [showNewCat, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  async function handleCreateCategory() {
    if (!newCatName) return;
    setCreatingCat(true);
    const result = await createCategoryAction({
      name: newCatName,
      slug: slugify(newCatName, { lower: true, strict: true }),
      isVisible: true,
      sortOrder: 0,
      isFeaturedOnHome: false,
      specifications: [],
    } as any);
    setCreatingCat(false);

    if (result.success) {
      const newCat = { id: (result as any).data.id, name: newCatName };
      setCategories(prev => [...prev, newCat]);
      setCategoryId(newCat.id);
      setShowNewCategory(false);
      setNewCatName("");
      toast.success("Category created and selected.");
    } else {
      toast.error(result.error);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setItems(files.map(file => ({ file, status: "IDLE" })));
  }

  async function startUpload() {
    if (!categoryId) return toast.error("Please select a category first.");
    if (items.length === 0) return toast.error("Please select images to upload.");

    setIsProcessing(true);
    const categoryName = categories.find(c => c.id === categoryId)?.name || "General";

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;

      updateItemStatus(i, "PROCESSING");

      const formData = new FormData();
      formData.append("file", item.file);

      const result = await processSingleBatchProductAction(formData, categoryId, categoryName);

      if (result.success) {
        updateItemStatus(i, "SUCCESS");
      } else {
        updateItemStatus(i, "ERROR", result.error);
      }
    }

    await finishBatchAction();
    setIsProcessing(false);
    toast.success("Batch upload complete.");
  }

  function updateItemStatus(index: number, status: UploadItem["status"], error?: string) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, status, error } : item));
  }

  const successCount = items.filter(i => i.status === "SUCCESS").length;
  const progressPercent = items.length > 0 ? (items.filter(i => i.status !== "IDLE").length / items.length) * 100 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Batch Settings</CardTitle>
            <CardDescription>Select a category and drop images to auto-generate products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Target Category</Label>
              <div className="flex gap-2">
                {!showNewCat ? (
                  <>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => setShowNewCategory(true)}>
                      <Plus className="size-4 mr-2" /> New
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="Category name..."
                      className="flex-1"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                    />
                    <Button disabled={creatingCat} onClick={handleCreateCategory}>
                      {creatingCat ? <Loader2 className="size-4 animate-spin" /> : "Create"}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowNewCategory(false)}>Cancel</Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-files">Product Images</Label>
              <div
                className="relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50"
                onClick={() => document.getElementById("batch-files")?.click()}
              >
                <Upload className="mb-4 size-10 text-muted-foreground" />
                <p className="text-sm font-medium">Click or drag images to upload</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG or WebP (max 5MB each)</p>
                <input
                  id="batch-files"
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Processing Queue ({items.length})</CardTitle>
              {isProcessing && <Loader2 className="size-5 animate-spin text-brand" />}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Overall Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                      <tr className="border-b text-left">
                        <th className="px-4 py-2 font-medium">File Name</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-2 truncate max-w-[200px]">{item.file.name}</td>
                          <td className="px-4 py-2">
                            {item.status === "IDLE" && <span className="text-muted-foreground">Pending</span>}
                            {item.status === "PROCESSING" && <span className="text-brand flex items-center gap-1.5"><Loader2 className="size-3 animate-spin" /> Analyzing...</span>}
                            {item.status === "SUCCESS" && <span className="text-success flex items-center gap-1.5"><CheckCircle2 className="size-3" /> Created</span>}
                            {item.status === "ERROR" && <span className="text-destructive flex items-center gap-1.5" title={item.error}><AlertCircle className="size-3" /> Error</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader>
            <CardTitle>Action Center</CardTitle>
            <CardDescription className="text-primary-foreground/70">Review and start the automation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>Selected Category:</span>
              <span className="font-bold">{categories.find(c => c.id === categoryId)?.name || "None"}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>Total Images:</span>
              <span className="font-bold">{items.length}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>Success:</span>
              <span className="font-bold text-success-foreground">{successCount}</span>
            </div>

            <Button
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90 mt-4"
              size="lg"
              disabled={isProcessing || items.length === 0 || !categoryId}
              onClick={startUpload}
            >
              {isProcessing ? "Processing..." : "Start Batch Generation"}
            </Button>

            {successCount > 0 && !isProcessing && (
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => router.push("/admin/products")}>
                View Products
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>• <strong>Smart Naming:</strong> Filenames are converted to professional titles automatically.</p>
            <p>• <strong>Auto-Specs:</strong> Technical fields are filled based on the category's professional standards.</p>
            <p>• <strong>Direct Publish:</strong> Products are set to "Published" status by default.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
