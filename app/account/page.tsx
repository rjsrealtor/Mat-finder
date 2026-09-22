"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        router.push("/login");
        return;
      }
      setUserId(userRes.user.id);
      setEmail(userRes.user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userRes.user.id)
        .single();
      setDisplayName(profile?.display_name ?? "");
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const name = displayName.trim();
    if (name.length < 2 || name.length > 30) {
      setError("Display name must be 2–30 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", userId!)
      .select("id");
    setBusy(false);
    if (error || !data || data.length === 0) {
      setError(error?.message ?? "Couldn't save your display name. Please try again.");
      return;
    }
    setNotice("Saved. Your reviews now show this name.");
  }

  if (loading) {
    return <p className="max-w-[420px] mx-auto px-5 py-14 text-dim text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-[420px] mx-auto px-5 py-14">
      <h1 className="text-2xl mb-1">Your account</h1>
      <p className="text-dim text-sm mb-6">Signed in as {email}. Your email is never shown publicly.</p>

      <form onSubmit={save} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="displayName" className="text-xs font-semibold text-dim uppercase tracking-wide">
            Display name
          </label>
          <input
            id="displayName"
            required
            minLength={2}
            maxLength={30}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg border border-border bg-surface text-ink p-2.5 text-sm"
          />
          <p className="text-xs text-dim">Shown next to your reviews.</p>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {notice && <p className="text-sm text-accent">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent text-accentInk font-semibold py-2.5 text-sm mt-1 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
