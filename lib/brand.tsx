// Mat Finder mark rendered for generated images (app icons, previews).
// Same drawing as the navbar logo, on the dark brand background.

export const BRAND_BG = "#101613";
export const BRAND_ACCENT = "#45b78c";
export const BRAND_GOLD = "#e2b155";

/**
 * Square app icon: a white BJJ gi with a black belt (red rank bar) on a green
 * disc over the dark brand background. `padding` is the fraction of the edge
 * left empty around the artwork — maskable Android icons need ~20% so
 * launchers can crop to a circle.
 */
export function AppIcon({
  size,
  padding = 0.08,
  background = BRAND_BG,
}: {
  size: number;
  padding?: number;
  /** Tile colour behind the green disc (white for the app launch screen). */
  background?: string;
}) {
  const art = Math.round(size * (1 - padding * 2));
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background,
      }}
    >
      <svg width={art} height={art} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="48" fill={BRAND_ACCENT} />
        {/* jacket with sleeves */}
        <path
          d="M36 17 L44 14 L50 24 L56 14 L64 17 L86 33 L79 46 L70 41 L70 84 L30 84 L30 41 L21 46 L14 33 Z"
          fill="#f4f2ec"
          stroke="#1b2420"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* neck opening */}
        <path d="M44 14 L50 30 L56 14 Z" fill={BRAND_ACCENT} />
        {/* crossed lapels, starting inside the collar line */}
        <path d="M45.5 18.5 L60 57" stroke="#c9c4b8" strokeWidth="6" />
        <path d="M54.5 18.5 L50 30" stroke="#c9c4b8" strokeWidth="6" />
        <path d="M45.5 18.5 L60 57 M54.5 18.5 L50 30" stroke="#1b2420" strokeWidth="1.2" opacity="0.5" />
        {/* redraw the collar edge over the lapel ends */}
        <path d="M36 17 L44 14 L50 24 L56 14 L64 17" stroke="#1b2420" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
        {/* black belt */}
        <rect x="29" y="56" width="42" height="9" rx="1.5" fill="#111" />
        {/* belt ends hanging from the knot */}
        <path d="M46 63 L38 82 L44 84 L51 65 Z" fill="#111" />
        <path d="M54 63 L61 84 L67 82 L57 64 Z" fill="#111" />
        {/* red rank bar on one end */}
        <path d="M59.2 74.6 L64.9 72.6 L66 75.8 L60.3 77.9 Z" fill="#c8372d" />
        {/* knot */}
        <rect x="44.5" y="54" width="11" height="13" rx="2" fill="#111" stroke="#2c2c2c" strokeWidth="1" />
      </svg>
    </div>
  );
}
