import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the redirect Supabase sends after a user confirms their email
// (or completes an OAuth flow, if one is added later) — exchanges the
// auth code in the URL for a session cookie, then sends them home.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
