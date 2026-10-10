import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Emails the site owner when someone creates an account. Called by a database
// trigger on profiles (supabase/signup-alerts.sql). The request only carries the
// new profile's id; we look it up ourselves and only alert for profiles created
// in the last few minutes, so the endpoint can't be used to send arbitrary mail.

const OWNER_EMAIL = "rjsrealtor@gmail.com";
const FRESH_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!id || !url || !key) return NextResponse.json({ ok: false }, { status: 400 });
  if (!resendKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY not set" }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!profile || Date.now() - new Date(profile.created_at).getTime() > FRESH_MS) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });

  const name = profile.display_name || "Someone";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Mat Finder <noreply@matfinderbjj.com>",
      to: OWNER_EMAIL,
      subject: `New Mat Finder signup: ${name}`,
      text: `${name} just created a Mat Finder account.\n\nTotal accounts: ${count ?? "?"}\n\nhttps://www.matfinderbjj.com`,
    }),
  });
  return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
}
