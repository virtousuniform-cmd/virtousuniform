import Image from "next/image";
import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos from our factory floor, products, and industry events.",
};

export default async function GalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { createdAt: "desc" },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });

  const hasMedia = albums.some((a) => a.media.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Photos & Videos"
        description="A look inside our factory, products, and the events we take part in."
      />

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        {!hasMedia ? (
          <div className="rounded-lg border border-dashed border-border py-24 text-center">
            <p className="text-muted-foreground">No gallery content published yet.</p>
          </div>
        ) : (
          albums
            .filter((a) => a.media.length > 0)
            .map((album) => (
              <div key={album.id}>
                <h2 className="text-xl font-semibold text-foreground">{album.title}</h2>
                {album.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{album.description}</p>
                )}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {album.media.map((m) => (
                    <div
                      key={m.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      {m.type === "IMAGE" ? (
                        <Image
                          src={m.url}
                          alt={m.caption ?? album.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-full items-center justify-center bg-card"
                        >
                          <PlayCircle className="size-8 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </>
  );
}
