"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ListingCard from "./ListingCard";
import AddListingModal from "./AddListingModal";
import RateModal from "./RateModal";
import ReportModal from "./ReportModal";
import { STATE_NAMES } from "@/lib/us-states";
import type { ListingWithRating } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

function stateFullName(stateCode: string) {
  return STATE_NAMES[stateCode.trim().toUpperCase()] ?? stateCode;
}

function listingSearchText(l: ListingWithRating) {
  return `${l.name} ${l.city} ${l.state} ${stateFullName(l.state)}`.toLowerCase();
}

type GiFilter = "any" | "gi" | "nogi" | "gi_nogi";
type FeeFilter = "any" | "free" | "fee";

export default function ListingsApp() {
  const supabase = createClient();

  const [listings, setListings] = useState<ListingWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [day, setDay] = useState("any");
  const [gi, setGi] = useState<GiFilter>("any");
  const [fee, setFee] = useState<FeeFilter>("any");
  const [minRating, setMinRating] = useState(0);
  const [showFlagged, setShowFlagged] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [rateTarget, setRateTarget] = useState<ListingWithRating | null>(null);
  const [reportTarget, setReportTarget] = useState<ListingWithRating | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings_with_rating")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setLoadError(error.message);
    } else {
      setLoadError(null);
      setListings((data ?? []) as ListingWithRating[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [load, supabase]);

  const days = useMemo(() => {
    const set = new Set(listings.map((l) => l.day));
    return Array.from(set).sort();
  }, [listings]);

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    for (const l of listings) {
      set.add(`${l.city}, ${l.state}`);
      set.add(stateFullName(l.state));
    }
    return Array.from(set).sort();
  }, [listings]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return locationOptions.filter((opt) => opt.toLowerCase().includes(q)).slice(0, 8);
  }, [locationOptions, search]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((l) => {
      const flagged = l.status === "closed" || l.visitor_policy === "members_only";
      if (flagged && !showFlagged) return false;
      if (q && !listingSearchText(l).includes(q)) return false;
      if (day !== "any" && l.day !== day) return false;
      if (gi !== "any" && l.gi !== gi) return false;
      if (fee === "free" && l.fee_cents !== 0) return false;
      if (fee === "fee" && !(typeof l.fee_cents === "number" && l.fee_cents > 0)) return false;
      if (minRating > 0 && l.rating_avg < minRating) return false;
      return true;
    });
  }, [listings, search, day, gi, fee, minRating, showFlagged]);

  function requireAuth(action: () => void) {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    action();
  }

  return (
    <div className="max-w-[1080px] mx-auto px-5 pb-16">
      <section className="py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl">Find a BJJ open mat</h1>
        <p className="text-dim mt-2 max-w-[60ch]">
          Free, crowd-verified open mats and drop-in sessions. Filter by day, gi or no-gi, fee and
          rating — every listing here allows visitors.
        </p>
      </section>

      <section className="sticky top-0 z-20 -mx-5 px-5 py-3 bg-bg border-y border-border">
        <div className="flex flex-wrap gap-2 items-center">
          <div ref={searchBoxRef} className="relative flex-1 min-w-[180px]">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search by gym, city or state…"
              className="w-full rounded-lg border border-border bg-surface text-ink px-3 py-2 text-sm"
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-surface card-shadow overflow-hidden">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch(s);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface2"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded-lg border border-border bg-surface text-ink px-2.5 py-2 text-sm"
          >
            <option value="any">Any day</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={gi}
            onChange={(e) => setGi(e.target.value as GiFilter)}
            className="rounded-lg border border-border bg-surface text-ink px-2.5 py-2 text-sm"
          >
            <option value="any">Gi or No-Gi</option>
            <option value="gi">Gi</option>
            <option value="nogi">No-Gi</option>
            <option value="gi_nogi">Gi & No-Gi</option>
          </select>

          <select
            value={fee}
            onChange={(e) => setFee(e.target.value as FeeFilter)}
            className="rounded-lg border border-border bg-surface text-ink px-2.5 py-2 text-sm"
          >
            <option value="any">Any fee</option>
            <option value="free">Free only</option>
            <option value="fee">Charges a fee</option>
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface text-ink px-2.5 py-2 text-sm"
          >
            <option value={0}>Any rating</option>
            <option value={3}>3+ stars</option>
            <option value={4}>4+ stars</option>
            <option value={4.5}>4.5+ stars</option>
          </select>

          <label className="flex items-center gap-1.5 text-sm text-dim px-1">
            <input type="checkbox" checked={showFlagged} onChange={(e) => setShowFlagged(e.target.checked)} />
            Show closed / members-only
          </label>

          <button
            onClick={() => requireAuth(() => setAddOpen(true))}
            className="ml-auto rounded-full bg-accent text-accentInk text-sm font-semibold px-4 py-2"
          >
            + Add open mat
          </button>
        </div>
      </section>

      <section className="py-6">
        {loading && <p className="text-dim text-sm">Loading listings…</p>}
        {loadError && <p className="text-danger text-sm">{loadError}</p>}
        {!loading && !loadError && filtered.length === 0 && (
          <p className="text-dim text-sm">No open mats match those filters yet.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onRate={(l) => requireAuth(() => setRateTarget(l))}
              onReport={(l) => requireAuth(() => setReportTarget(l))}
            />
          ))}
        </div>
      </section>

      {!user && !loading && (
        <p className="text-xs text-dim text-center pb-4">
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Sign in
          </Link>{" "}
          to add listings, rate mats, or report changes.
        </p>
      )}

      {addOpen && <AddListingModal onClose={() => setAddOpen(false)} onDone={load} />}
      {rateTarget && (
        <RateModal listing={rateTarget} onClose={() => setRateTarget(null)} onDone={load} />
      )}
      {reportTarget && (
        <ReportModal listing={reportTarget} onClose={() => setReportTarget(null)} onDone={load} />
      )}
    </div>
  );
}
