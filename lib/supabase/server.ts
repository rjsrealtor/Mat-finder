import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Route Handlers and
 * Server Actions. Reads/writes the auth session via Next.js cookies so
 * the signed-in user carries across server and client.
 *
 * Not typed against a generated `Database` schema — see the note in
 * lib/supabase/client.ts.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — middleware.ts
            // refreshes the session instead, so this is safe to ignore.
          }
        },
      },
    }
  );
}
