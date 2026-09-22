import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingsApp from "@/components/ListingsApp";
import CityLinks from "@/components/CityLinks";
import { fetchAllListings } from "@/lib/supabase/public";
import { SITE_URL, groupByCity, isVisitable, type CityGroup } from "@/lib/cities";

// Pages are built ahead of time and refreshed hourly; a city added since the
// last build is generated on its first visit.
export const revalidate = 3600;
export const dynamicParams = true;

async function getCity(slug: string): Promise<{ city: CityGroup; others: CityGroup[] } | null> {
  const all = groupByCity(await fetchAllListings());
  const city = all.find((c) => c.slug === slug);
  if (!city) return null;
  const others = all
    .filter((c) => c.slug !== slug && c.listings.some(isVisitable))
    .map((c) => ({ ...c, listings: c.listings.filter(isVisitable) }));
  // Same-state cities first, then everything else.
  // Nearby first: same state/region, then same country, then everything else.
  const closeness = (c: CityGroup) =>
    (c.country === city.country ? 2 : 0) + (c.country === city.country && c.state === city.state ? 1 : 0);
  others.sort((a, b) => closeness(b) - closeness(a));
  return { city, others: others.slice(0, 24) };
}

export async function generateStaticParams() {
  return groupByCity(await fetchAllListings()).map((c) => ({ city: c.slug }));
}

function describe(c: CityGroup) {
  const open = c.listings.filter(isVisitable);
  const days = Array.from(new Set(open.map((l) => l.day))).slice(0, 3).join(", ");
  const count = open.length === 1 ? "1 BJJ open mat" : `${open.length} BJJ open mats`;
  return `${count} in ${c.label}${days ? ` — ${days}` : ""}. Days, times, gi or no-gi, drop-in fees and visitor rules, kept up to date by local grapplers.`;
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const found = await getCity(params.city);
  if (!found) return { title: "City not found | Mat Finder" };
  const { city } = found;
  const title = `BJJ Open Mats in ${city.label} | Mat Finder`;
  const description = describe(city);
  return {
    title,
    description,
    alternates: { canonical: `/open-mats/${city.slug}` },
    openGraph: { title, description, url: `/open-mats/${city.slug}` },
    twitter: { title, description },
  };
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const found = await getCity(params.city);
  if (!found) notFound();
  const { city, others } = found;

  // Structured data so search engines understand each listing is a place to train.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `BJJ open mats in ${city.label}`,
    url: `${SITE_URL}/open-mats/${city.slug}`,
    itemListElement: city.listings.filter(isVisitable).map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SportsActivityLocation",
        name: l.name,
        address: l.address,
        description: `Open mat: ${l.day}, ${l.time}${l.fee_note ? ` · ${l.fee_note}` : ""}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ListingsApp
        initialListings={city.listings}
        city={{ city: city.city, state: city.state, country: city.country }}
        title={`BJJ open mats in ${city.label}`}
        intro={describe(city)}
      >
        <CityLinks cities={others} heading="Open mats in other cities" />
      </ListingsApp>
    </>
  );
}
