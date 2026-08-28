import type { Metadata } from "next";
import { galleryRepository } from "@/features/gallery/repositories/gallery.repository";
import { CreateAlbumForm } from "@/features/gallery/components/create-album-form";
import { AlbumCard } from "@/features/gallery/components/album-card";

export const metadata: Metadata = { title: "Gallery — Admin" };

export default async function AdminGalleryPage() {
  const albums = await galleryRepository.findAllAlbums();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Gallery</h1>
        <p className="text-sm text-muted-foreground">
          {albums.length} album{albums.length === 1 ? "" : "s"}
        </p>
      </div>

      <CreateAlbumForm />

      {albums.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No albums yet — create one above to start uploading photos and videos.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              albumId={album.id}
              title={album.title}
              description={album.description}
              media={album.media}
            />
          ))}
        </div>
      )}
    </div>
  );
}
