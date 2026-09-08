import { createClient } from "@supabase/supabase-js";

/**
 * Public (browser-safe) Supabase client — anon key only.
 * Use for read-only, RLS-protected operations from Client Components.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
