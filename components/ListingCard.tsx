"use client";

import StarRating from "./StarRating";
import type { ListingWithRating } from "@/lib/types";

const GI_LABEL: Record<string, string> = {
  gi: "Gi",
  nogi: "No-Gi",
  gi_nogi: "Gi & No-Gi",
};

function feeLabel(l: ListingWithRating) {
  if (l.fee_cents === 0) return "Free";
  if (l.fee_cents === null || l.fee_cents === undefined) return l.fee_note || "Varies";
  return `$${(l.fee_cents / 100).toFixed(l.fee_cents % 100 === 0 ? 0 : 2)}`;
}

export default function ListingCard({
  listing,
  onRate,
  onReport,
}: {
  listing: ListingWithRating;
  onRate: (listing: ListingWithRating) => void;
  onReport: (listing: ListingWithRating) => void;
}) {
  const isMembersOnly = listing.visitor_policy === "members_only";
  const isClosed = listing.status === "closed";
  const flagged = isMembersOnly || isClosed;

  return (
    <div
      className={`card-shadow rounded-card border border-border bg-surface p-4 flex flex-col gap-3 ${
        flagged ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base leading-tight">{listing.name}</h3>
          <p className="text-sm text-dim mt-0.5">
            {listing.city}, {listing.state}
          </p>
        </div>
        {isClosed && (
          <span className="shrink-0
