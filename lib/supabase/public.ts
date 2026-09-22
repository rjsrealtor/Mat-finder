import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { ListingWithRating } from "@/lib/types";

/**
 * Cookie-less Supabase client for public, cacheable reads (city pages,
 * sitemap). Untyped like the other clients (see lib/supabase/client.ts).
 * Unlike lib/supabase/server.ts it doesn't touch the request's
 * cookies, so pages using it can be statically generated and revalidated.
 */
function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function fetchAllListings(): Promise<ListingWithRating[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("listings_with_rating")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    console.error("fetchAllListings:", error.message);
    return [];
  }
  return (data ?? []) as ListingWithRating[];
}
