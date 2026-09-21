"use client";

import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { createClient } from "@/lib/supabase/client";
import type { ListingWithRating } from "@/lib/types";

export default function RateModal({
  listing,
  onClose,
  onDone,
}: {
  listing: ListingWithRating;
  onClose: () => void;
  onDone: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
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
    if (stars < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setBusy(true);
    setError(null);

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setError("You need to be signed in to rate a mat.");
      setBusy(false);
      return;
    }

    const { error: upsertError } = await supabase.from("ratings").upsert(
      {
        listing_id: listing.id,
        user_id: userRes.user.id,
        stars,
        comment: comment.trim() || null,
      },
      { onConflict: "listing_id,user_id" }
    );

    setBusy(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    onDone();
    close();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-card border border-border bg-surface text-ink p-0 w-[min(420px,92vw)] backdrop:bg-black/40"
    >
      <form method="dialog" onSubmit={(e) => e.preventDefault()} className="p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-lg">Rate this open mat</h2>
          <p className="text-sm text-dim mt-0.5">{listing.name}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-dim uppercase tracking-wide">Your rating</label>
          <StarRating value={stars} interactive size={28} onChange={setStars} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rate-comment" className="text-xs font-semibold text-dim uppercase tracking-wide">
            Comment (optional)
          </label>
          <textarea
            id="rate-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="rounded-lg border border-border bg-bg text-ink p-2 text-sm resize-none"
            placeholder="How was the roll? Good energy, safe training, etc."
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
            {busy ? "Saving…" : "Submit rating"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
