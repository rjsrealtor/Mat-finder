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
