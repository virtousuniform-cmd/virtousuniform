import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { blogRepository } from "@/features/blog/repositories/blog.repository";
import { BlogPostsTable } from "@/features/blog/components/blog-posts-table";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/shared/admin-pagination";

export const metadata: Metadata = { title: "Blog — Admin" };

const PAGE_SIZE = 20;

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await blogRepository.findMany({
    search: params.search,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground">
            {total} post{total === 1 ? "" : "s"} total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus /> New Post
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No posts yet. Create your first post to get started.
          </p>
        </div>
      ) : (
        <>
          <BlogPostsTable posts={items} />
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/blogs"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
