import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { contentPageRepository } from "@/features/cms/repositories/content-page.repository";
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
import { formatDate } from "@/lib/utils";
import { DeletePageButton } from "@/features/cms/components/delete-page-button";

export const metadata = { title: "Custom Pages — Admin CMS" };

export default async function AdminCmsPagesListPage() {
  const pages = await contentPageRepository.findMany();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Custom Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage company pages like About Us, Manufacturing Process, etc.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cms/pages/new">
            <Plus className="mr-2 size-4" /> Create Page
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No pages created yet.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium text-foreground">
                    {page.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant={page.status === "PUBLISHED" ? "success" : "secondary"}>
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(page.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/cms/pages/${page.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeletePageButton id={page.id} title={page.title} />
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
