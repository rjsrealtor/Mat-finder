import type { MetadataRoute } from "next";
import { fetchAllListings } from "@/lib/supabase/public";
import { SITE_URL, groupByCity, groupByGym, groupByState } from "@/lib/cities";
import type { ListingWithRating } from "@/lib/types";

export const revalidate = 3600;

function lastModified(listings: ListingWithRating[]) {
  const t = Math.max(0, ...listings.map((l) => new Date(l.updated_at).getTime() || 0));
  return t ? new Date(t) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await fetchAllListings();
  const cities = groupByCity(listings);
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/open-mats`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/app`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/support`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...groupByState(cities).map((s) => ({
      url: `${SITE_URL}/open-mats/state/${s.slug}`,
      lastModified: lastModified(s.cities.flatMap((c) => c.listings)),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...cities.map((c) => ({
      url: `${SITE_URL}/open-mats/${c.slug}`,
      lastModified: lastModified(c.listings),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...groupByGym(listings).map((g) => ({
      url: `${SITE_URL}/gym/${g.slug}`,
      lastModified: lastModified(g.listings),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
