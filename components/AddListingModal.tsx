"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, CURRENCIES, defaultCurrency, normalizeWebsite } from "@/lib/location";
import type { GiType, ListingStatus, ListingWithRating, VisitorPolicy } from "@/lib/types";

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

const DAY_OPTIONS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const empty = {
  name: "",
  city: "",
  state: "",
  country: "US",
  address: "",
  phone: "",
  website: "",
  day: "Sunday",
  startTime: "10:00 AM",
  endTime: "12:00 PM",
  gi: "gi_nogi" as GiType,
  feeType: "free" as "free" | "fee" | "varies",
  feeAmount: "",
  currency: "USD",
  feeNote: "",
  visitorPolicy: "open" as VisitorPolicy,
  policyNote: "",
  // Edit mode only: free-text time (older listings aren't in "start – end" form) and status.
  timeText: "",
  status: "active" as ListingStatus,
};

function formFromListing(l: ListingWithRating): typeof empty {
  return {
    ...empty,
    name: l.name,
    city: l.city,
    state: l.state,
    country: l.country || "US",
    address: l.address,
    phone: l.phone ?? "",
    website: l.website ?? "",
    day: l.day,
    timeText: l.time,
    gi: l.gi,
    feeType: l.fee_cents === 0 ? "free" : l.fee_cents == null ? "varies" : "fee",
    feeAmount: l.fee_cents ? String(l.fee_cents / 100) : "",
    currency: l.currency || defaultCurrency(l.country || "US"),
    feeNote: l.fee_note ?? "",
    visitorPolicy: l.visitor_policy,
    policyNote: l.policy_note ?? "",
    status: l.status,
  };
}

export default function AddListingModal({
  onClose,
  onDone,
  listing,
}: {
  onClose: () => void;
  onDone: () => void;
  /** When set, the modal edits this listing (admin only) instead of adding a new one. */
  listing?: ListingWithRating;
}) {
  const editing = Boolean(listing);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState(() => (listing ? formFromListing(listing) : empty));
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
    const hasTime = editing ? Boolean(form.timeText.trim()) : Boolean(form.startTime && form.endTime);
    const isUS = form.country === "US";
    // A US state is required (2-letter code); elsewhere the region is optional.
    if (!form.name.trim() || !form.city.trim() || (isUS && !form.state.trim()) || !form.address.trim() || !form.day.trim() || !hasTime) {
      setError(`Please fill in name, city, ${isUS ? "state, " : ""}address, day and time.`);
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

    const fields = {
      name: form.name.trim(),
      city: form.city.trim(),
      state: isUS ? form.state.trim().toUpperCase() : form.state.trim(),
      country: form.country,
      address: form.address.trim(),
      phone: form.phone.trim() || null,
      website: normalizeWebsite(form.website),
      day: form.day.trim(),
      time: editing ? form.timeText.trim() : `${form.startTime} – ${form.endTime}`,
      gi: form.gi,
      fee_cents,
      currency: form.currency,
      fee_note: form.feeNote.trim() || null,
      visitor_policy: form.visitorPolicy,
      policy_note: form.policyNote.trim() || null,
    };

    let saveError: string | null = null;
    if (listing) {
      // RLS only lets admins update; a non-admin gets 0 rows back rather than an error.
      const { data, error } = await supabase
        .from("listings")
        .update({ ...fields, status: form.status, updated_at: new Date().toISOString() })
        .eq("id", listing.id)
        .select("id");
      if (error) saveError = error.message;
      else if (!data || data.length === 0) saveError = "You don't have permission to edit this listing.";
    } else {
      const { error } = await supabase.from("listings").insert({
        ...fields,
        status: "active",
        source: "community",
        created_by: userRes.user.id,
      });
      if (error) saveError = error.message;
    }

    setBusy(false);
    if (saveError) {
      setError(
        saveError.includes("duplicate key")
          ? "That gym already has an open mat listed at this day and time."
          : saveError
      );
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
          <h2 className="text-lg">{editing ? "Edit open mat" : "Add an open mat"}</h2>
          <p className="text-sm text-dim mt-0.5">
            {editing
              ? "Admin edit — changes show on the site right away."
              : "Know a gym with a solid drop-in open mat? Add it so the community can find it."}
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
            <label className={labelClass}>{form.country === "US" ? "State" : "State / region (optional)"}</label>
            <input
              className={inputClass}
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              maxLength={form.country === "US" ? 2 : 60}
              placeholder={form.country === "US" ? "CA" : "e.g. England, São Paulo"}
            />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Country</label>
            <select
              className={inputClass}
              value={form.country}
              onChange={(e) =>
                setForm((f) => ({ ...f, country: e.target.value, currency: defaultCurrency(e.target.value) }))
              }
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Phone (optional)</label>
            <input
              className={inputClass}
              type="tel"
              placeholder="e.g. (714) 555-0123"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelClass}>Website (optional)</label>
            <input
              className={inputClass}
              inputMode="url"
              placeholder="e.g. mygym.com"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Day</label>
            <select className={inputClass} value={form.day} onChange={(e) => set("day", e.target.value)}>
              {(DAY_OPTIONS.includes(form.day) ? DAY_OPTIONS : [form.day, ...DAY_OPTIONS]).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {editing ? (
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Time</label>
              <input
                className={inputClass}
                placeholder="e.g. 11:00 AM – 12:30 PM"
                value={form.timeText}
                onChange={(e) => set("timeText", e.target.value)}
              />
            </div>
          ) : (
          <>
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
          </>
          )}

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
              <label className={labelClass}>Amount</label>
              <div className="flex gap-1.5">
                <input
                  className={`${inputClass} min-w-0 flex-1`}
                  placeholder="10"
                  inputMode="decimal"
                  value={form.feeAmount}
                  onChange={(e) => set("feeAmount", e.target.value)}
                />
                <select
                  className={inputClass}
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  aria-label="Currency"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
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
              {editing && <option value="members_only">Members only</option>}
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

        {editing && (
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value as ListingStatus)}
            >
              <option value="active">Active</option>
              <option value="closed">Closed / no longer offered</option>
            </select>
          </div>
        )}

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
            {busy ? (editing ? "Saving…" : "Adding…") : editing ? "Save changes" : "Add open mat"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
