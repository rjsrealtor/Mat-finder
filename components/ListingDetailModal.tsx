"use client";

import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { createClient } from "@/lib/supabase/client";
import { GI_LABEL, feeLabel, telHref } from "./ListingCard";
import type { ListingWithRating } from "@/lib/types";

type Review = {
  id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  profiles: { display_name: string | null } | null;
};

const POLICY_LABEL: Record<string, string> = {
  open: "Open to all visitors",
  conditions: "Open with conditions",
  members_only: "Members only",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Full details for one listing, including every written review. */
export default function ListingDetailModal({
  listing,
  onClose,
  onRate,
  onReport,
  onEdit,
}: {
  listing: ListingWithRating;
  onClose: () => void;
  onRate: (listing: ListingWithRating) => void;
  onReport: (listing: ListingWithRating) => void;
  onEdit?: (listing: ListingWithRating) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    supabase
      .from("ratings")
      .select("id, stars, comment, created_at, profiles(display_name)")
      .eq("listing_id", listing.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setReviews((data ?? []) as unknown as Review[]);
      });
  }, [supabase, listing.id]);

  function close() {
    dialogRef.current?.close();
    onClose();
  }

  // Hand off to another modal (rate / report / edit) after closing this one.
  function then(action?: (l: ListingWithRating) => void) {
    return () => {
      close();
      action?.(listing);
    };
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`;
  const written = reviews?.filter((r) => r.comment) ?? [];

  const rows: [string, React.ReactNode][] = [
    ["When", `${listing.day} · ${listing.time}`],
    ["Gi / No-Gi", GI_LABEL[listing.gi] ?? listing.gi],
    ["Fee", listing.fee_note && listing.fee_note !== feeLabel(listing) ? `${feeLabel(listing)} — ${listing.fee_note}` : feeLabel(listing)],
    ["Visitors", listing.policy_note ? `${POLICY_LABEL[listing.visitor_policy]} — ${listing.policy_note}` : POLICY_LABEL[listing.visitor_policy]],
    [
      "Address",
      <a key="a" href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
        {listing.address}
      </a>,
    ],
    ...(listing.phone
      ? ([
          [
            "Phone",
            <a key="p" href={telHref(listing.phone)} className="text-accent hover:underline">
              {listing.phone}
            </a>,
          ],
        ] as [string, React.ReactNode][])
      : []),
    ["Last updated", formatDate(listing.updated_at)],
  ];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && close()}
      className="rounded-card border border-border bg-surface text-ink p-0 w-[min(560px,92vw)] backdrop:bg-black/40"
    >
      <div className="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl leading-tight">{listing.name}</h2>
            <p className="text-sm text-dim mt-0.5">
              {listing.city}, {listing.state}
            </p>
            {listing.status === "closed" && (
              <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full bg-dangerBg text-danger">
                Reported closed
              </span>
            )}
          </div>
          <button onClick={close} aria-label="Close" className="text-dim hover:text-ink text-xl leading-none px-1">
            ×
          </button>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-dim">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <section className="border-t border-border pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base">Reviews</h3>
            <StarRating value={listing.rating_avg} count={listing.rating_count} />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          {!reviews && !error && <p className="text-sm text-dim">Loading reviews…</p>}
          {reviews && written.length === 0 && (
            <p className="text-sm text-dim">
              {reviews.length > 0 ? "No written reviews yet — just star ratings." : "No reviews yet. Be the first!"}
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {written.map((r) => (
              <li key={r.id} className="rounded-lg bg-surface2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <StarRating value={r.stars} size={14} />
                  <span className="text-xs text-dim">
                    {r.profiles?.display_name || "Member"} · {formatDate(r.created_at)}
                  </span>
                </div>
                <p className="text-sm mt-1.5 whitespace-pre-line">{r.comment}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          {onEdit && (
            <button onClick={then(onEdit)} className="text-sm px-3 py-1.5 rounded-lg border border-border text-gold font-semibold">
              Edit
            </button>
          )}
          <button onClick={then(onReport)} className="text-sm px-3 py-1.5 rounded-lg border border-border text-dim">
            Report a change
          </button>
          <button onClick={then(onRate)} className="text-sm px-4 py-1.5 rounded-lg bg-accent text-accentInk font-semibold">
            Write a review
          </button>
        </div>
      </div>
    </dialog>
  );
}
