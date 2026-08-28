"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteBlogPostAction } from "../actions/blog.actions";
import { formatDate } from "@/lib/utils";

type PostRow = {
  id: string;
  title: string;
  status: string;
  createdAt: Date | string;
  category: { name: string } | null;
  author: { name: string } | null;
};

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "outline"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  SCHEDULED: "warning",
  ARCHIVED: "outline",
};

export function BlogPostsTable({ posts }: { posts: PostRow[] }) {
  const [rows, setRows] = useState(posts);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteBlogPostAction(id);
      if (result.success) {
        toast.success("Post deleted.");
        setRows((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(result.error);
      }
      setDeletingId(null);
    });
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/admin/blogs/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {post.category?.name ?? "Uncategorized"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {post.author?.name ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[post.status] ?? "outline"}>{post.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(post.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/blogs/${post.id}`} aria-label="Edit post">
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(post.id, post.title)}
                    disabled={isPending && deletingId === post.id}
                    aria-label="Delete post"
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
