"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ListingWithRating, ReportType } from "@/lib/types";

const REPORT_OPTIONS: { value: ReportType; label: string; hint: string }[] = [
  { value: "closed", label: "No longer offered", hint: "This open mat doesn't run anymore." },
  { value: "members_only", label: "Members only", hint: "Visitors from other academies aren't actually allowed." },
  { value: "correction", label: "Day / time / fee changed", hint: "Update the details below." },
];

export default function ReportModal({
  listing,
  onClose,
  onDone,
}: {
  listing: ListingWithRating;
  onClose: () => void;
  onDone: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [type, setType] = useState<ReportType>("correction");
  const [day, setDay] = useState(listing.day);
  const [time, setTime] = useState(listing.time);
  const [feeNote, setFeeNote] = useState(listing.fee_note ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function close() {
    dialogRef.current?.close();
    onClose();
  }

  async function submit() {
    setBusy(true);
    setError(null);

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setError("You need to be signed in to report a listing.");
      setBusy(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc("apply_report", {
      p_listing_id: listing.id,
      p_type: type,
      p_day: type === "correction" ? day : null,
      p_time: type === "correction" ? time : null,
      p_fee_note: type === "correction" ? feeNote : null,
      p_note: note.trim() || null,
    });

    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onDone();
    close();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-card border border-border bg-surface text-ink p-0 w-[min(460px,92vw)] backdrop:bg-black/40"
    >
      <form method="dialog" onSubmit={(e) => e.preventDefault()} className="p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-lg">Report an issue</h2>
          <p className="text-sm text-dim mt-0.5">{listing.name}</p>
        </div>

        <div className="flex flex-col gap-2">
          {REPORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer ${
                type === opt.value ? "border-accent bg-goldBg/40" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="report-type"
                className="mt-1"
                checked={type === opt.value}
                onChange={() => setType(opt.value)}
              />
              <span>
                <span className="block text-sm font-semibold">{opt.label}</span>
                <span className="block text-xs text-dim">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>

        {type === "correction" && (
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-dim uppercase tracking-wide">Day</label>
              <input
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-lg border border-border bg-bg text-ink p-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-dim uppercase tracking-wide">Time</label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-lg border border-border bg-bg text-ink p-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-semibold text-dim uppercase tracking-wide">Fee</label>
              <input
                value={feeNote}
                onChange={(e) => setFeeNote(e.target.value)}
                placeholder="e.g. Free, or $10 drop-in"
                className="rounded-lg border border-border bg-bg text-ink p-2 text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-dim uppercase tracking-wide">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="rounded-lg border border-border bg-bg text-ink p-2 text-sm resize-none"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={close}
            className="text-sm px-3 py-1.5 rounded-lg border border-border text-dim"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="text-sm px-4 py-1.5 rounded-lg bg-accent text-accentInk font-semibold disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
