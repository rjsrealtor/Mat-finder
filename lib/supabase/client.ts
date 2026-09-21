import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

/**
 * Supabase client for use in Client Components ("use client").
 * Safe to call anywhere on the client — reuses the anon (public) key,
 * which is meant to be public. All access control happens via Postgres
 * Row Level Security policies (see supabase/schema.sql), not this key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
