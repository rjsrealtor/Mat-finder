import type { Metadata } from "next";
import Link from "next/link";
import { fetchAllListings } from "@/lib/supabase/public";
import { groupByCity, isVisitable, regionHeading } from "@/lib/cities";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "BJJ Open Mats by City, Worldwide | Mat Finder",
  description:
    "Browse Brazilian Jiu-Jitsu open mats city by city, around the world — days, times, gi or no-gi, drop-in fees and visitor policies, kept up to date by the grappling community.",
  alternates: { canonical: "/open-mats" },
};

export default async function OpenMatsIndex() {
  const cities = groupByCity((await fetchAllListings()).filter(isVisitable));

  // US cities are filed under their state, everywhere else under the country.
  const byRegion = new Map<string, { heading: string; country: string; cities: typeof cities }>();
  for (const c of cities) {
    const heading = regionHeading(c);
    const key = `${c.country}|${heading}`;
    const group = byRegion.get(key) ?? { heading, country: c.country, cities: [] };
    group.cities.push(c);
    byRegion.set(key, group);
  }
  // United States first, then other countries alphabetically.
  const regions = Array.from(byRegion.values()).sort(
    (a, b) => Number(b.country === "US") - Number(a.country === "US") || a.heading.localeCompare(b.heading)
  );

  return (
    <div className="max-w-[1080px] mx-auto px-5 pb-16">
      <section className="py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl">BJJ open mats by city</h1>
        <p className="text-dim mt-2 max-w-[60ch]">
          Pick a city to see every open mat we know about there. Don&apos;t see yours?{" "}
          <Link href="/" className="text-accent font-semibold hover:underline">
            Add it
          </Link>{" "}
          — it takes about a minute.
        </p>
      </section>

      {regions.length === 0 && <p className="text-dim text-sm">No cities listed yet.</p>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((r) => (
          <section key={`${r.country}|${r.heading}`}>
            <h2 className="text-lg mb-2">{r.heading}</h2>
            <ul className="flex flex-col gap-1.5">
              {r.cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/open-mats/${c.slug}`} className="hover:text-accent hover:underline">
                    Open mats in {c.city}
                  </Link>{" "}
                  <span className="text-dim text-sm">({c.listings.length})</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
