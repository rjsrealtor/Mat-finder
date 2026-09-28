import { NextResponse } from "next/server";

// Turns a gym address into map coordinates for "near me". US addresses go to
// the free US Census geocoder; anything it can't place (and non-US addresses)
// falls back to OpenStreetMap Nominatim, then to the city centre.

type Hit = { lat: number; lng: number; precision: "address" | "city" };

async function census(address: string): Promise<Hit | null> {
  const url =
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?" +
    new URLSearchParams({ address, benchmark: "Public_AR_Current", format: "json" });
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const match = (await res.json())?.result?.addressMatches?.[0]?.coordinates;
  return match ? { lat: match.y, lng: match.x, precision: "address" } : null;
}

async function nominatim(q: string, country: string, precision: Hit["precision"]): Promise<Hit | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({ q, format: "json", limit: "1", countrycodes: country.toLowerCase() });
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "MatFinder/1.0 (https://www.matfinderbjj.com)" },
  });
  if (!res.ok) return null;
  const hit = (await res.json())?.[0];
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), precision } : null;
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const address = (params.get("address") ?? "").slice(0, 300).trim();
  const city = (params.get("city") ?? "").slice(0, 100).trim();
  const state = (params.get("state") ?? "").slice(0, 60).trim();
  const country = (params.get("country") ?? "US").slice(0, 2).toUpperCase();
  if (!address && !city) return NextResponse.json({ error: "address or city required" }, { status: 400 });

  try {
    const hit =
      (country === "US" && address ? await census(address) : null) ??
      (address ? await nominatim(address, country, "address") : null) ??
      (city ? await nominatim([city, state].filter(Boolean).join(", "), country, "city") : null);
    return NextResponse.json(hit ?? { lat: null, lng: null });
  } catch {
    return NextResponse.json({ lat: null, lng: null });
  }
}
