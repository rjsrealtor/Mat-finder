import type { ListingWithRating } from "@/lib/types";
import { countryName, placeLabel } from "@/lib/location";
import { STATE_NAMES } from "@/lib/us-states";

export const SITE_URL = "https://www.matfinderbjj.com";

export interface CityGroup {
  slug: string;
  city: string;
  state: string;
  country: string;
  /** "Costa Mesa, CA" / "London, England, United Kingdom" */
  label: string;
  listings: ListingWithRating[];
}

function slugify(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** US keeps its original "costa-mesa-ca" URLs; elsewhere the country code is appended ("london-england-gb"). */
export function citySlug(city: string, state: string, country = "US") {
  return country === "US" ? slugify(city, state) : slugify(city, state, country);
}

/** Heading a city is filed under on /open-mats: the US state name, or the country name. */
export function regionHeading(c: { state: string; country: string }) {
  if (c.country === "US") return STATE_NAMES[c.state.trim().toUpperCase()] ?? c.state;
  return countryName(c.country);
}

/** Visible listings only — closed / members-only mats aren't useful to a visitor. */
export function isVisitable(l: ListingWithRating) {
  return l.status !== "closed" && l.visitor_policy !== "members_only";
}

/** Groups listings by city + state + country, largest cities first. */
export function groupByCity(listings: ListingWithRating[]): CityGroup[] {
  const groups = new Map<string, CityGroup>();
  for (const l of listings) {
    const country = l.country || "US";
    const slug = citySlug(l.city, l.state, country);
    if (!slug) continue;
    let g = groups.get(slug);
    if (!g) {
      g = { slug, city: l.city, state: l.state, country, label: placeLabel({ ...l, country }), listings: [] };
      groups.set(slug, g);
    }
    g.listings.push(l);
  }
  return Array.from(groups.values()).sort(
    (a, b) => b.listings.length - a.listings.length || a.city.localeCompare(b.city)
  );
}

// ---------- gyms ----------

export interface GymGroup {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  /** "Costa Mesa, CA" */
  place: string;
  citySlug: string;
  /** One entry per open-mat session (a gym with Sat + Sun open mats has two). */
  listings: ListingWithRating[];
}

/** /gym/<slug>, e.g. "alliance-bjj-houston-houston-tx". */
export function gymSlug(l: { name: string; city: string; state: string; country?: string }) {
  const country = l.country || "US";
  return country === "US" ? slugify(l.name, l.city, l.state) : slugify(l.name, l.city, l.state, country);
}

export function groupByGym(listings: ListingWithRating[]): GymGroup[] {
  const groups = new Map<string, GymGroup>();
  for (const l of listings) {
    const country = l.country || "US";
    const slug = gymSlug({ ...l, country });
    if (!slug) continue;
    let g = groups.get(slug);
    if (!g) {
      g = {
        slug,
        name: l.name,
        city: l.city,
        state: l.state,
        country,
        place: placeLabel({ ...l, country }),
        citySlug: citySlug(l.city, l.state, country),
        listings: [],
      };
      groups.set(slug, g);
    }
    g.listings.push(l);
  }
  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// ---------- US states ----------

export interface StateGroup {
  slug: string;
  code: string;
  name: string;
  cities: CityGroup[];
  listingCount: number;
}

/** /open-mats/state/<slug>, e.g. "texas", "new-york". */
export function stateSlug(code: string) {
  return slugify(STATE_NAMES[code.trim().toUpperCase()] ?? code);
}

/** US cities grouped by state, most listings first. */
export function groupByState(cities: CityGroup[]): StateGroup[] {
  const groups = new Map<string, StateGroup>();
  for (const c of cities) {
    if (c.country !== "US" || !STATE_NAMES[c.state.trim().toUpperCase()]) continue;
    const code = c.state.trim().toUpperCase();
    let g = groups.get(code);
    if (!g) {
      g = { slug: stateSlug(code), code, name: STATE_NAMES[code], cities: [], listingCount: 0 };
      groups.set(code, g);
    }
    g.cities.push(c);
    g.listingCount += c.listings.length;
  }
  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
}

