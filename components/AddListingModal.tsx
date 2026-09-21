"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GiType, VisitorPolicy } from "@/lib/types";

// 15-minute increments across a full day, e.g. "12:00 AM", "12:15 AM", … "11:45 PM".
function buildTimeOptions() {
  const options: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    let hour24 = Math.floor(minutes / 60);
    const min = minutes % 60;
    const period = hour24 < 12 ? "AM" : "PM";
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    options.push(`${hour12}:${String(min).padStart(2, "0")} ${period}`);
  }
  return options;
}

const empty = {
  name: "",
  city: "",
  state: "",
  address: "",
  day: "",
  startTime: "10:00 AM",
  endTime: "12:00 PM",
  gi: "gi_nogi" as GiType,
  feeType: "free" as "free" | "fee" | "varies",
  feeAmount: "",
  feeNote: "",
  visitorPolicy: "open" as VisitorPolicy,
  policyNote: "",
};

export default function AddListingModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function close() {
    dialogRef.current?.close();
    onClose();
  }

  function set<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim() || !form.city.trim() || !form.state.trim() || !form.address.trim() || !form.day.trim() || !form.startTime || !form.endTime) {
      setError("Please fill in name, city, state, address, day and time.");
      return;
    }
    setBusy(true);
    setError(null);

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setError("You need to be signed in to add a listing.");
      setBusy(false);
      return;
    }

    let fee_cents: number | null = null;
    if (form.feeType === "free") fee_cents = 0;
    else if (form.feeType === "fee") {
      const dollars = parseFloat(form.feeAmount);
      fee_cents = Number.isFinite(dollars) ? Math.round(dollars * 100) : null;
    } else {
      fee_cents = null;
    }

    const { error: insertError } = await supabase.from("listings").insert({
      name: form.name.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      address: form.address.trim(),
      day: form.day.trim(),
      time: `${form.startTime} – ${form.endTime}`,
      gi: form.gi,
      fee_cents,
      fee_note: form.feeNote.trim() || null,
      visitor_policy: form.visitorPolicy,
      policy_note: form.policyNote.trim() || null,
      status: "active",
      source: "community",
      created_by: userRes.user.id,
    });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onDone();
    close();
  }

  const inputClass = "rounded-lg border border-border bg-bg text-ink p-2 text-sm";
  const labelClass = "text-xs font-semibold text-dim uppercase tracking-wide";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-card border border-border bg-surface text-ink p-0 w-[min(560px,92vw)] backdrop:bg-black/40"
    >
      <form
        method="dialog"
        onSubmit={(e) => e.preventDefault()}
        className="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
      >
        <div>
          <h2 className="text-lg">Add an open mat</h2>
          <p className="text-sm text-dim mt-0.5">
            Know a gym with a solid drop-in open mat? Add it so the community can find it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Gym / club name</label>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>City</label>
            <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>State</label>
            <input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={2} />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Day</label>
            <input
              className={inputClass}
              placeholder="e.g. Sunday"
              value={form.day}
              onChange={(e) => set("day", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Start time</label>
            <select
              className={inputClass}
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>End time</label>
            <select
              className={inputClass}
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Gi / No-Gi</label>
            <select className={inputClass} value={form.gi} onChange={(e) => set("gi", e.target.value as GiType)}>
              <option value="gi_nogi">Gi & No-Gi</option>
              <option value="gi">Gi only</option>
              <option value="nogi">No-Gi only</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Fee</label>
            <select
              className={inputClass}
              value={form.feeType}
              onChange={(e) => set("feeType", e.target.value as typeof form.feeType)}
            >
              <option value="free">Free</option>
              <option value="fee">Charges a fee</option>
              <option value="varies">Varies / ask the gym</option>
            </select>
          </div>

          {form.feeType === "fee" && (
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Amount (USD)</label>
              <input
                className={inputClass}
                placeholder="10"
                inputMode="decimal"
                value={form.feeAmount}
                onChange={(e) => set("feeAmount", e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Fee note (optional)</label>
            <input
              className={inputClass}
              placeholder="e.g. Free for members, $10 for visitors"
              value={form.feeNote}
              onChange={(e) => set("feeNote", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Visitor policy</label>
            <select
              className={inputClass}
              value={form.visitorPolicy}
              onChange={(e) => set("visitorPolicy", e.target.value as VisitorPolicy)}
            >
              <option value="open">Open to all visitors</option>
              <option value="conditions">Open with conditions (belt, experience, age, etc.)</option>
            </select>
            <p className="text-xs text-dim mt-0.5">
              Only add members-only mats if you want to warn others — those get flagged automatically.
            </p>
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Policy note (optional)</label>
            <input
              className={inputClass}
              placeholder="e.g. 18+, waiver required, bring your own gi"
              value={form.policyNote}
              onChange={(e) => set("policyNote", e.target.value)}
            />
          </div>
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
            {busy ? "Adding…" : "Add open mat"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
