import { prisma } from "@/lib/prisma";
import type { Prisma, ContentStatus } from "@prisma/client";
import slugify from "slugify";
import type { BlogPostFormValues } from "../schemas/blog.schema";

async function resolveTagIds(tagNames: string[]) {
  const ids: string[] = [];
  for (const raw of tagNames) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name, { lower: true, strict: true });
    const tag = await prisma.blogTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    ids.push(tag.id);
  }
  return ids;
}

export const blogRepository = {
  async findMany(params: {
    status?: ContentStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.BlogPostWhereInput = {
      deletedAt: null,
      ...(params.status && { status: params.status }),
      ...(params.search && {
        title: { contains: params.search, mode: "insensitive" },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { category: true, author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.blogPost.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });
  },

  async slugExists(slug: string, excludeId?: string) {
    const existing = await prisma.blogPost.findFirst({
      where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    });
    return !!existing;
  },

  async create(data: BlogPostFormValues, authorId: string) {
    const tagIds = await resolveTagIds(data.tags);

    return prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        featuredImage: data.featuredImage || null,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        categoryId: data.categoryId || null,
        authorId,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
  },

  async update(id: string, data: BlogPostFormValues) {
    const tagIds = await resolveTagIds(data.tags);
    const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });

    return prisma.$transaction(async (tx) => {
      await tx.blogPostTag.deleteMany({ where: { postId: id } });

      return tx.blogPost.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || null,
          content: data.content,
          featuredImage: data.featuredImage || null,
          status: data.status,
          publishedAt:
            data.status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          categoryId: data.categoryId || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords,
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
        },
      });
    });
  },

  async softDelete(id: string) {
    return prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });
  },
};
