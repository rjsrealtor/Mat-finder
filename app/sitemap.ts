import type { MetadataRoute } from "next";
import { fetchAllListings } from "@/lib/supabase/public";
import { SITE_URL, groupByCity } from "@/lib/cities";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = groupByCity(await fetchAllListings());
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/open-mats`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...cities.map((c) => ({
      url: `${SITE_URL}/open-mats/${c.slug}`,
      lastModified: new Date(
        Math.max(...c.listings.map((l) => new Date(l.updated_at).getTime() || 0), 0) || now.getTime()
      ),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
