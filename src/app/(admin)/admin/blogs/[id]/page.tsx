import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogCategoryRepository } from "@/features/blog/repositories/blog-category.repository";
import { blogRepository } from "@/features/blog/repositories/blog.repository";
import { BlogPostForm } from "@/features/blog/components/blog-post-form";

export const metadata: Metadata = { title: "Edit Post — Admin" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    blogRepository.findById(id),
    blogCategoryRepository.findAll(),
  ]);

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{post.title}</h1>
        <p className="text-sm text-muted-foreground">/blog/{post.slug}</p>
      </div>

      <BlogPostForm
        postId={post.id}
        categories={categories}
        defaultValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          featuredImage: post.featuredImage ?? "",
          status: post.status,
          scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString().slice(0, 16) : "",
          categoryId: post.categoryId ?? "",
          tags: post.tags.map((t) => t.tag.name),
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          seoKeywords: post.seoKeywords,
        }}
      />
    </div>
  );
}
