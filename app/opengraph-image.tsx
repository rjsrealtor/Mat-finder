import { ImageResponse } from "next/og";

// Preview card shown when a Mat Finder link is shared (texts, social, Slack…).
export const alt = "Mat Finder — find BJJ open mats near you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#101613",
          color: "#eef1ee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="88" height="88" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="14" stroke="#45b78c" strokeWidth="2" />
            <path d="M9 15c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#45b78c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="15" cy="15" r="2.2" fill="#e2b155" />
          </svg>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: 2 }}>MAT FINDER</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Find a BJJ open mat near you</div>
          <div style={{ fontSize: 34, color: "#93a39b" }}>
            Days, times, gi or no-gi, drop-in fees and visitor rules — free, and kept up to date by grapplers.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30 }}>
          <div style={{ color: "#45b78c", fontWeight: 700 }}>matfinderbjj.com</div>
          <div style={{ color: "#e2b155" }}>270+ open mats · 170+ cities</div>
        </div>
      </div>
    ),
    size
  );
}
