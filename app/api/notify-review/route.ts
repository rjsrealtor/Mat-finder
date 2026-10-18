import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { gymSlug } from "@/lib/cities";

// Emails the site owner when someone rates or reviews a gym. Called by a
// database trigger on ratings (supabase/review-alerts.sql). The request only
// carries the rating's id; we look it up ourselves and only alert for ratings
// written in the last few minutes, so the endpoint can't be used to send
// arbitrary mail.

const OWNER_EMAIL = "rjsrealtor@gmail.com";
const FRESH_MS = 10 * 60 * 1000;

type Row = {
  stars: number;
  comment: string | null;
  created_at: string;
  updated_at: string | null;
  profiles: { display_name: string | null } | null;
  listings: { name: string; city: string; state: string; country: string | null } | null;
};

export async function POST(req: Request) {
  const { id, edited } = (await req.json().catch(() => ({}))) as { id?: string; edited?: boolean };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!id || !url || !key) return NextResponse.json({ ok: false }, { status: 400 });
  if (!resendKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY not set" }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  // The trigger fires before the row is committed, so give it a moment to land.
  let row: Row | null = null;
  for (let i = 0; i < 5 && !row; i++) {
    if (i) await new Promise((r) => setTimeout(r, 1000));
    const { data } = await supabase
      .from("ratings")
      .select("stars, comment, created_at, updated_at, profiles(display_name), listings(name, city, state, country)")
      .eq("id", id)
      .maybeSingle();
    row = data as unknown as Row | null;
  }
  const written = row ? new Date(row.updated_at ?? row.created_at).getTime() : 0;
  if (!row || !row.listings || Date.now() - written > FRESH_MS) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const gym = row.listings;
  const who = row.profiles?.display_name || "Someone";
  const stars = "★".repeat(row.stars) + "☆".repeat(5 - row.stars);
  const link = `https://www.matfinderbjj.com/gym/${gymSlug({ ...gym, country: gym.country ?? undefined })}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Mat Finder <noreply@matfinderbjj.com>",
      to: OWNER_EMAIL,
      subject: `${edited ? "Edited review" : "New review"}: ${gym.name} ${row.stars}/5`,
      text:
        `${who} ${edited ? "updated their review of" : "reviewed"} ${gym.name} (${gym.city}, ${gym.state}).\n\n` +
        `${stars}\n${row.comment ? `"${row.comment}"` : "(no written comment)"}\n\n${link}`,
    }),
  });
  return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
}
