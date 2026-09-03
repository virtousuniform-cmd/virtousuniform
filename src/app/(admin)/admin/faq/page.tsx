import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { faqRepository } from "@/features/cms/repositories/faq.repository";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteFaqButton } from "@/features/cms/components/delete-faq-button";

export const metadata = { title: "FAQs — Admin" };

export default async function AdminFaqListPage() {
  const faqs = await faqRepository.findAll();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h1>
          <p className="text-sm text-muted-foreground">
            Manage the questions and answers shown on the public FAQ page.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/faq/new">
            <Plus className="mr-2 size-4" /> Add FAQ
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No FAQs found.
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium text-foreground line-clamp-1 py-4">
                    {faq.question}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{faq.category || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={faq.isVisible ? "success" : "secondary"}>
                      {faq.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>{faq.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/faq/${faq.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteFaqButton id={faq.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
