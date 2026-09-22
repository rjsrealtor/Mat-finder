import type { ListingWithRating } from "@/lib/types";

export const SITE_URL = "https://www.matfinderbjj.com";

export interface CityGroup {
  slug: string;
  city: string;
  state: string;
  listings: ListingWithRating[];
}

export function citySlug(city: string, state: string) {
  return `${city}-${state}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Visible listings only — closed / members-only mats aren't useful to a visitor. */
export function isVisitable(l: ListingWithRating) {
  return l.status !== "closed" && l.visitor_policy !== "members_only";
}

/** Groups listings by city + state, largest cities first. */
export function groupByCity(listings: ListingWithRating[]): CityGroup[] {
  const groups = new Map<string, CityGroup>();
  for (const l of listings) {
    const slug = citySlug(l.city, l.state);
    if (!slug) continue;
    let g = groups.get(slug);
    if (!g) {
      g = { slug, city: l.city, state: l.state, listings: [] };
      groups.set(slug, g);
    }
    g.listings.push(l);
  }
  return Array.from(groups.values()).sort(
    (a, b) => b.listings.length - a.listings.length || a.city.localeCompare(b.city)
  );
}
