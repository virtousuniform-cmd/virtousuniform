import { createClient } from "@supabase/supabase-js";

/**
 * Public (browser-safe) Supabase client — anon key only.
 * Use for read-only, RLS-protected operations from Client Components.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * Privileged server-only Supabase client — service role key.
 * NEVER import this in a Client Component or expose it to the browser.
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
