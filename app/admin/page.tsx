"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PendingReport = {
  id: string;
  type: "closed" | "members_only" | "correction";
  payload: { day?: string; time?: string; fee_note?: string } | null;
  note: string | null;
  created_at: string;
  listings: { name: string; city: string; state: string } | null;
  profiles: { display_name: string | null } | null;
};

const TYPE_LABEL: Record<string, string> = {
  closed: "No longer offered",
  members_only: "Members only",
  correction: "Day / time / fee change",
};

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select("id, type, payload, note, created_at, listings(name, city, state), profiles(display_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setReports((data ?? []) as unknown as PendingReport[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function check() {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userRes.user.id)
        .single();

      if (!profile?.is_admin) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      setIsAdmin(true);
      setChecking(false);
      load();
    }
    check();
  }, [supabase, router, load]);

  async function resolve(id: string, approve: boolean) {
    setBusyId(id);
    const { error } = await supabase.rpc("resolve_report", {
      p_report_id: id,
      p_approve: approve,
    });
    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  if (checking) {
    return <div className="max-w-[720px] mx-auto px-5 py-14 text-dim text-sm">Checking access…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-[720px] mx-auto px-5 py-14">
        <h1 className="text-2xl mb-2">Not authorized</h1>
        <p className="text-dim text-sm">This page is only available to admin accounts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-5 py-10">
      <h1 className="text-2xl mb-1">Pending updates</h1>
      <p className="text-dim text-sm mb-6">
        Community-submitted reports waiting for review. Approving applies the change to the
        listing; rejecting dismisses it with no effect.
      </p>

      {loading && <p className="text-dim text-sm">Loading…</p>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}
      {!loading && reports.length === 0 && !error && (
        <p className="text-dim text-sm">Nothing pending — you're all caught up.</p>
      )}

      <div className="flex flex-col gap-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-card border border-border bg-surface p-4 card-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-base leading-tight">{r.listings?.name ?? "Unknown listing"}</h3>
                <p className="text-sm text-dim">
                  {r.listings?.city}, {r.listings?.state}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-goldBg text-gold">
                {TYPE_LABEL[r.type] ?? r.type}
              </span>
            </div>

            {r.type === "correction" && r.payload && (
              <div className="text-sm text-ink mb-2 flex flex-col gap-0.5">
                {r.payload.day && <p>Day → {r.payload.day}</p>}
                {r.payload.time && <p>Time → {r.payload.time}</p>}
                {r.payload.fee_note && <p>Fee → {r.payload.fee_note}</p>}
              </div>
            )}

            {r.note && <p className="text-sm text-dim italic mb-2">"{r.note}"</p>}

            <p className="text-xs text-dim mb-3">
              Submitted by {r.profiles?.display_name ?? "a user"} ·{" "}
              {new Date(r.created_at).toLocaleDateString()}
            </p>

            <div className="flex gap-2">
              <button
                disabled={busyId === r.id}
                onClick={() => resolve(r.id, true)}
                className="text-sm px-3 py-1.5 rounded-lg bg-accent text-accentInk font-semibold disabled:opacity-60"
              >
                Approve
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => resolve(r.id, false)}
                className="text-sm px-3 py-1.5 rounded-lg border border-border text-dim disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
