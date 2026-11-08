// House ad for Quiet Pressure, Ryan's BJJ gi brand (www.quietpressurebjj.com).
// Shown as a card in the open-mat grid on the home, city and gym pages, so it
// also shows in the iOS app (which loads the live site). Clearly labeled "Ad".

const QP_URL = "https://www.quietpressurebjj.com/?utm_source=matfinder&utm_medium=listing_card&utm_campaign=edition_001";

export default function QuietPressureAd() {
  return (
    <a
      href={QP_URL}
      target="_blank"
      rel="noopener sponsored"
      aria-label="Ad: Quiet Pressure Edition 001 gi — reserve yours free"
      className="card-shadow rounded-card border border-border bg-surface overflow-hidden flex hover:border-accent transition-colors"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ads/quiet-pressure.jpg"
        alt="White Quiet Pressure gi with white patches"
        width={640}
        height={640}
        loading="lazy"
        className="w-32 sm:w-36 shrink-0 object-cover bg-surface2"
      />
      <div className="p-4 flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface2 text-dim">
            Ad
          </span>
          <span className="text-xs text-dim truncate">quietpressurebjj.com</span>
        </div>
        <h3 className="text-base leading-tight">Quiet Pressure gi — Edition 001</h3>
        <p className="text-sm text-dim">
          A clean, no-loud-logos gi designed by a black belt. Small first run.
        </p>
        <span className="mt-auto self-start rounded-full bg-accent text-accentInk text-sm font-semibold px-3 py-1.5">
          Reserve free →
        </span>
      </div>
    </a>
  );
}
