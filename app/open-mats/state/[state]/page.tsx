import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingsApp from "@/components/ListingsApp";
import { fetchAllListings } from "@/lib/supabase/public";
import { SITE_URL, groupByCity, groupByGym, groupByState, isVisitable, type StateGroup } from "@/lib/cities";

export const revalidate = 3600;
export const dynamicParams = true;

async function getState(slug: string): Promise<StateGroup | null> {
  return groupByState(groupByCity(await fetchAllListings())).find((s) => s.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return groupByState(groupByCity(await fetchAllListings())).map((s) => ({ state: s.slug }));
}

function describe(s: StateGroup) {
  const top = [...s.cities].sort((a, b) => b.listings.length - a.listings.length).slice(0, 4).map((c) => c.city);
  const mats = s.listingCount === 1 ? "1 BJJ open mat" : `${s.listingCount} BJJ open mats`;
  const cities = s.cities.length === 1 ? "1 city" : `${s.cities.length} cities`;
  return `${mats} across ${cities} in ${s.name}${top.length ? `, including ${top.join(", ")}` : ""}. Days, times, gi or no-gi, drop-in fees and visitor rules.`;
}

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const s = await getState(params.state);
  if (!s) return { title: "State not found | Mat Finder" };
  const title = `BJJ Open Mats in ${s.name} | Mat Finder`;
  const description = describe(s);
  return {
    title,
    description,
    alternates: { canonical: `/open-mats/state/${s.slug}` },
    openGraph: { title, description, url: `/open-mats/state/${s.slug}` },
    twitter: { title, description },
  };
}

export default async function StatePage({ params }: { params: { state: string } }) {
  const s = await getState(params.state);
  if (!s) notFound();

  const listings = s.cities.flatMap((c) => c.listings);
  const gyms = groupByGym(listings.filter(isVisitable));
  const cities = [...s.cities].sort((a, b) => a.city.localeCompare(b.city));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `BJJ open mats in ${s.name}`,
    url: `${SITE_URL}/open-mats/state/${s.slug}`,
    itemListElement: cities.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Open mats in ${c.label}`,
      url: `${SITE_URL}/open-mats/${c.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="max-w-[1080px] mx-auto px-5 pt-6 text-sm text-dim">
        <Link href="/open-mats" className="hover:text-accent">Open mats</Link>
        {" › "}
        {s.name}
      </nav>
      <ListingsApp
        initialListings={listings}
        scope={{ country: "US", state: s.code }}
        title={`BJJ open mats in ${s.name}`}
        intro={describe(s)}
      >
        <section className="py-6 border-t border-border">
          <h2 className="text-xl mb-3">Cities in {s.name}</h2>
          <ul className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/open-mats/${c.slug}`}
                  className="inline-block rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
                >
                  {c.city} <span className="text-dim">({c.listings.length})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {gyms.length > 0 && (
          <section className="py-6 border-t border-border">
            <h2 className="text-xl mb-3">Gyms with open mats in {s.name}</h2>
            <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              {gyms.map((g) => (
                <li key={g.slug}>
                  <Link href={`/gym/${g.slug}`} className="hover:text-accent hover:underline">
                    {g.name}
                  </Link>{" "}
                  <span className="text-dim">· {g.city}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </ListingsApp>
    </>
  );
}
