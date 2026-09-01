import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ProductFormValues, ProductListQuery } from "../schemas/product.schema";

export const productRepository = {
  async findMany(query: ProductListQuery) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { sku: { contains: query.search, mode: "insensitive" } },
          { shortDescription: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  /** Public catalog: published products only. */
  async findPublished(query: ProductListQuery) {
    return this.findMany({ ...query, status: "PUBLISHED" });
  },

  async findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        specifications: { orderBy: { sortOrder: "asc" } },
        certificates: { include: { certificate: true } },
        relatedTo: {
          where: { status: "PUBLISHED", deletedAt: null },
          include: { images: { take: 1 } },
          take: 4,
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specifications: { orderBy: { sortOrder: "asc" } },
        certificates: true,
      },
    });
  },

  async slugExists(slug: string, excludeId?: string) {
    const existing = await prisma.product.findFirst({
      where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    });
    return !!existing;
  },

  async skuExists(sku: string, excludeId?: string) {
    if (!sku) return false;
    const existing = await prisma.product.findFirst({
      where: { sku, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    });
    return !!existing;
  },

  async create(data: ProductFormValues) {
    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku || null,
        modelNumber: data.modelNumber || null,
        categoryId: data.categoryId || null,
        shortDescription: data.shortDescription || null,
        longDescription: data.longDescription || null,
        material: data.material || null,
        coating: data.coating || null,
        protectionLevel: data.protectionLevel || null,
        applications: data.applications,
        features: data.features,
        colors: data.colors,
        sizes: data.sizes,
        packaging: data.packaging || null,
        moq: data.moq || null,
        weight: data.weight || null,
        stockStatus: data.stockStatus,
        status: data.status,
        isFeatured: data.isFeatured,
        brochurePdf: data.brochurePdf || null,
        videoUrl: data.videoUrl || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords,
        specifications: {
          create: data.specifications.map((s, i) => ({ ...s, sortOrder: i })),
        },
      } as any,
    });
  },

  async update(id: string, data: ProductFormValues) {
    return prisma.$transaction(async (tx) => {
      await tx.productSpecification.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku || null,
          modelNumber: data.modelNumber || null,
          categoryId: data.categoryId || null,
          shortDescription: data.shortDescription || null,
          longDescription: data.longDescription || null,
          material: data.material || null,
          coating: data.coating || null,
          protectionLevel: data.protectionLevel || null,
          applications: data.applications,
          features: data.features,
          colors: data.colors,
          sizes: data.sizes,
          packaging: data.packaging || null,
          moq: data.moq || null,
          weight: data.weight || null,
          stockStatus: data.stockStatus,
          status: data.status,
          isFeatured: data.isFeatured,
          brochurePdf: data.brochurePdf || null,
          videoUrl: data.videoUrl || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          seoKeywords: data.seoKeywords,
          specifications: {
            create: data.specifications.map((s, i) => ({ ...s, sortOrder: i })),
          },
        } as any,
      });
    });
  },

  /** Soft delete — preserves history/SEO redirects, hides from all queries. */
  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });
  },

  async addImages(
    productId: string,
    images: { url: string; altText?: string; isPrimary?: boolean }[],
  ) {
    return prisma.productImage.createMany({
      data: images.map((img, i) => ({
        productId,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary ?? i === 0,
        sortOrder: i,
      })),
    });
  },

  async removeImage(imageId: string) {
    return prisma.productImage.delete({ where: { id: imageId } });
  },

  async setFeatured(id: string, isFeatured: boolean) {
    return prisma.product.update({ where: { id }, data: { isFeatured } });
  },

  async countFeatured() {
    return prisma.product.count({
      where: { isFeatured: true, status: "PUBLISHED", deletedAt: null },
    });
  },
};
