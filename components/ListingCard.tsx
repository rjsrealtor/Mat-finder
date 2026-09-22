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
  onEdit,
  onDelete,
}: {
  listing: ListingWithRating;
  onRate: (listing: ListingWithRating) => void;
  onReport: (listing: ListingWithRating) => void;
  /** Admin-only actions; buttons are hidden when these aren't passed. */
  onEdit?: (listing: ListingWithRating) => void;
  onDelete?: (listing: ListingWithRating) => void;
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
          <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-dangerBg text-danger">
            Closed
          </span>
        )}
        {!isClosed && isMembersOnly && (
          <span className="shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-dangerBg text-danger">
            Members only
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="px-2 py-1 rounded-full bg-surface2 text-ink">{listing.day}</span>
        <span className="px-2 py-1 rounded-full bg-surface2 text-ink">{listing.time}</span>
        <span className="px-2 py-1 rounded-full bg-goldBg text-gold font-medium">
          {GI_LABEL[listing.gi] ?? listing.gi}
        </span>
        <span className="px-2 py-1 rounded-full bg-surface2 text-ink">{feeLabel(listing)}</span>
      </div>

      {listing.policy_note && (
        <p className="text-sm text-dim">{listing.policy_note}</p>
      )}

      <p className="text-xs text-dim">{listing.address}</p>

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-border">
        <StarRating value={listing.rating_avg} count={listing.rating_count} />
        <div className="flex gap-2">
          <button
            onClick={() => onRate(listing)}
            className="text-xs font-semibold text-accent hover:underline"
          >
            Rate
          </button>
          <button
            onClick={() => onReport(listing)}
            className="text-xs font-semibold text-dim hover:text-danger hover:underline"
          >
            Report
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(listing)}
              className="text-xs font-semibold text-gold hover:underline"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(listing)}
              className="text-xs font-semibold text-danger hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
