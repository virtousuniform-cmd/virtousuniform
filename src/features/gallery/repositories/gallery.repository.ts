import { prisma } from "@/lib/prisma";
import type { GalleryMediaType } from "@prisma/client";
import type { GalleryAlbumFormValues } from "../schemas/gallery.schema";

export const galleryRepository = {
  async findAllAlbums() {
    return prisma.galleryAlbum.findMany({
      orderBy: { createdAt: "desc" },
      include: { media: { orderBy: { sortOrder: "asc" } }, _count: { select: { media: true } } },
    });
  },

  async findAlbumById(id: string) {
    return prisma.galleryAlbum.findUnique({
      where: { id },
      include: { media: { orderBy: { sortOrder: "asc" } } },
    });
  },

  async slugExists(slug: string, excludeId?: string) {
    const existing = await prisma.galleryAlbum.findFirst({
      where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    });
    return !!existing;
  },

  async createAlbum(data: GalleryAlbumFormValues) {
    return prisma.galleryAlbum.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
      },
    });
  },

  async deleteAlbum(id: string) {
    return prisma.galleryAlbum.delete({ where: { id } });
  },

  async addMedia(albumId: string, url: string, type: GalleryMediaType, caption?: string) {
    const count = await prisma.galleryMedia.count({ where: { albumId } });
    return prisma.galleryMedia.create({
      data: { albumId, url, type, caption, sortOrder: count },
    });
  },

  async removeMedia(id: string) {
    return prisma.galleryMedia.delete({ where: { id } });
  },
};
