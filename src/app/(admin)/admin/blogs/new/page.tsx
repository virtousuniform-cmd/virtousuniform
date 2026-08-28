import type { Metadata } from "next";
import { blogCategoryRepository } from "@/features/blog/repositories/blog-category.repository";
import { BlogPostForm } from "@/features/blog/components/blog-post-form";

export const metadata: Metadata = { title: "New Post — Admin" };

export default async function NewBlogPostPage() {
  const categories = await blogCategoryRepository.findAll();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New post</h1>
        <p className="text-sm text-muted-foreground">Save as Draft anytime and finish later.</p>
      </div>
      <BlogPostForm categories={categories} />
    </div>
  );
}
