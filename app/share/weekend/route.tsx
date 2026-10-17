import { ImageResponse } from "next/og";
import { fetchAllListings } from "@/lib/supabase/public";
import { milesBetween } from "@/lib/geo";
import type { ListingWithRating } from "@/lib/types";

// Instagram-story image (1080×1920) of this weekend's open mats in an area:
//   /share/weekend?area=oc   (or la, sd, ie)
//   /share/weekend?lat=..&lng=..&miles=20&name=Denver
// Posted weekly to Mat Finder's Instagram; gyms are tagged so they repost.

export const revalidate = 3600;

const AREAS: Record<string, { name: string; lat: number; lng: number; miles: number }> = {
  oc: { name: "Orange County", lat: 33.7, lng: -117.86, miles: 18 },
  la: { name: "Los Angeles", lat: 34.05, lng: -118.3, miles: 20 },
  sd: { name: "San Diego", lat: 32.8, lng: -117.15, miles: 22 },
  ie: { name: "Inland Empire", lat: 34.0, lng: -117.4, miles: 20 },
};

const GI_LABEL = { gi: "Gi", nogi: "No-Gi", gi_nogi: "Gi / No-Gi" } as const;

/** Minutes after midnight for the first time in "11:00 AM – 12:30 PM" (999 if none). */
function startMinutes(time: string) {
  const m = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return 999;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2] ?? 0);
}

function fee(l: ListingWithRating) {
  if (l.fee_cents === 0) return "Free";
  if (typeof l.fee_cents === "number") return `$${Math.round(l.fee_cents / 100)}`;
  return "";
}

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const preset = AREAS[(p.get("area") ?? "oc").toLowerCase()];
  const area =
    p.get("lat") && p.get("lng")
      ? {
          name: (p.get("name") ?? "Near you").slice(0, 30),
          lat: Number(p.get("lat")),
          lng: Number(p.get("lng")),
          miles: Number(p.get("miles") ?? 20),
        }
      : preset ?? AREAS.oc;

  const all = await fetchAllListings();
  const sessions = all
    .filter((l) => l.lat != null && l.lng != null && ["Saturday", "Sunday"].includes(l.day))
    .filter((l) => milesBetween(area, { lat: l.lat as number, lng: l.lng as number }) <= area.miles)
    .sort((a, b) => (a.day === b.day ? startMinutes(a.time) - startMinutes(b.time) : a.day === "Saturday" ? -1 : 1));
  const shown = sessions.slice(0, 12);

  const row = (l: ListingWithRating) => (
    <div key={l.id} style={{ display: "flex", flexDirection: "column", padding: "18px 0", borderBottom: "2px solid #e3e7e5" }}>
      <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#101613" }}>{l.name}</div>
      <div style={{ display: "flex", fontSize: 30, color: "#5b6661", marginTop: 4 }}>
        {`${l.time.replace(/\s*start$/i, "")} · ${l.city} · ${GI_LABEL[l.gi]}${fee(l) ? ` · ${fee(l)}` : ""}`}
      </div>
    </div>
  );

  const days = ["Saturday", "Sunday"] as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          padding: "90px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: 6, color: "#1f6f54" }}>
          MAT FINDER
        </div>
        <div style={{ display: "flex", fontSize: 86, fontWeight: 800, lineHeight: 1.05, color: "#101613", marginTop: 24 }}>
          Weekend open mats
        </div>
        <div style={{ display: "flex", fontSize: 54, fontWeight: 700, color: "#1f6f54", marginTop: 8 }}>{area.name}</div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 40, flexGrow: 1 }}>
          {shown.length === 0 && (
            <div style={{ display: "flex", fontSize: 40, color: "#5b6661" }}>No weekend open mats listed yet — add one!</div>
          )}
          {days.map((d) => {
            const list = shown.filter((l) => l.day === d);
            if (list.length === 0) return null;
            return (
              <div key={d} style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
                <div style={{ display: "flex", fontSize: 36, fontWeight: 800, color: "#e2b155", letterSpacing: 4, marginTop: 12 }}>
                  {d.toUpperCase()}
                </div>
                {list.map(row)}
              </div>
            );
          })}
          {sessions.length > shown.length && (
            <div style={{ display: "flex", fontSize: 30, color: "#5b6661", marginTop: 8 }}>
              {`+ ${sessions.length - shown.length} more on matfinderbjj.com`}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            background: "#1f6f54",
            color: "#ffffff",
            borderRadius: 28,
            padding: "28px 0",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          Find more at matfinderbjj.com
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
