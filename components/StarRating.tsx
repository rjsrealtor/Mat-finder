"use client";

/**
 * Small reusable star rating component.
 * - Read-only mode: pass `value` (can be fractional, e.g. 4.33) to display an average.
 * - Interactive mode: pass `interactive` + `onChange` to let the user pick 1-5 stars.
 */
export default function StarRating({
  value,
  count,
  size = 16,
  interactive = false,
  onChange,
}: {
  value: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (stars: number) => void;
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex" role={interactive ? "radiogroup" : undefined} aria-label="Rating">
        {stars.map((s) => {
          const filled = value >= s;
          const half = !filled && value >= s - 0.5;
          return (
            <button
              key={s}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(s)}
              aria-label={interactive ? `${s} star${s > 1 ? "s" : ""}` : undefined}
              className={interactive ? "cursor-pointer" : "cursor-default"}
              style={{ lineHeight: 0, background: "none", border: "none", padding: 0 }}
            >
              <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 1.5l2.6 5.3 5.8.85-4.2 4.1 1 5.8L10 14.75 4.8 17.55l1-5.8-4.2-4.1 5.8-.85L10 1.5z"
                  fill={filled || half ? "var(--gold)" : "none"}
                  stroke="var(--gold)"
                  strokeWidth="1.2"
                  fillOpacity={half ? 0.5 : 1}
                />
              </svg>
            </button>
          );
        })}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-dim">
          {value > 0 ? value.toFixed(1) : "—"} {count > 0 ? `(${count})` : "(no ratings)"}
        </span>
      )}
    </div>
  );
}
