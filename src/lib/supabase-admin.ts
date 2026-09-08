import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Privileged server-only Supabase client — service role key.
 * Used for admin-only storage writes (product images, certificates, brochures).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "gloves-platform";

/**
 * Uploads a file buffer to Supabase Storage and returns its public URL.
 * Path convention: `${folder}/${filename}` e.g. "products/nitrile-gloves-01.webp"
 */
export async function uploadToStorage(
  path: string,
  file: File | Buffer,
  contentType?: string,
) {
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}