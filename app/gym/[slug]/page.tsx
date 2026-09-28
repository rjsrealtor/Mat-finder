import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingsApp from "@/components/ListingsApp";
import { fetchAllListings } from "@/lib/supabase/public";
import { SITE_URL, groupByGym, stateSlug, type GymGroup } from "@/lib/cities";
import { websiteLabel } from "@/lib/location";
import { STATE_NAMES } from "@/lib/us-states";

// Built ahead of time and refreshed hourly; a gym added since the last build
// is generated on its first visit.
export const revalidate = 3600;
export const dynamicParams = true;

async function getGym(slug: string): Promise<GymGroup | null> {
  return groupByGym(await fetchAllListings()).find((g) => g.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return groupByGym(await fetchAllListings()).map((g) => ({ slug: g.slug }));
}

/** "Saturday 10:30 AM – 12:30 PM and Sunday 10:30 AM – 12:30 PM" */
function schedule(g: GymGroup) {
  return g.listings.map((l) => `${l.day} ${l.time}`).join(" and ");
}

function describe(g: GymGroup) {
  const first = g.listings[0];
  const fee = first.fee_cents === 0 ? " Free for visitors." : "";
  return `${g.name} open mat schedule in ${g.place}: ${schedule(g)}.${fee} Address, phone, drop-in fee, visitor policy and reviews from local grapplers.`.slice(0, 300);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const g = await getGym(params.slug);
  if (!g) return { title: "Gym not found | Mat Finder" };
  const title = `${g.name} Open Mat Schedule – ${g.place} | Mat Finder`;
  const description = describe(g);
  return {
    title,
    description,
    alternates: { canonical: `/gym/${g.slug}` },
    openGraph: { title, description, url: `/gym/${g.slug}` },
    twitter: { title, description },
  };
}

export default async function GymPage({ params }: { params: { slug: string } }) {
  const g = await getGym(params.slug);
  if (!g) notFound();

  const first = g.listings[0];
  const phone = g.listings.find((l) => l.phone)?.phone ?? null;
  const website = g.listings.find((l) => l.website)?.website ?? null;
  const ratingCount = g.listings.reduce((n, l) => n + Number(l.rating_count), 0);
  const ratingAvg =
    ratingCount > 0
      ? g.listings.reduce((s, l) => s + Number(l.rating_avg) * Number(l.rating_count), 0) / ratingCount
      : 0;
  const isUS = g.country === "US";
  const stateName = isUS ? STATE_NAMES[g.state.trim().toUpperCase()] : null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: g.name,
    url: `${SITE_URL}/gym/${g.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: first.address,
      addressLocality: g.city,
      ...(g.state ? { addressRegion: g.state } : {}),
      addressCountry: g.country,
    },
    ...(phone ? { telephone: phone } : {}),
    ...(website ? { sameAs: [website] } : {}),
    description: `Brazilian Jiu-Jitsu open mat: ${schedule(g)}.`,
    ...(ratingCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: ratingAvg.toFixed(1), reviewCount: ratingCount } }
      : {}),
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Open mats", item: `${SITE_URL}/open-mats` },
      ...(stateName
        ? [{ "@type": "ListItem", position: 2, name: stateName, item: `${SITE_URL}/open-mats/state/${stateSlug(g.state)}` }]
        : []),
      { "@type": "ListItem", position: stateName ? 3 : 2, name: g.city, item: `${SITE_URL}/open-mats/${g.citySlug}` },
      { "@type": "ListItem", position: stateName ? 4 : 3, name: g.name, item: `${SITE_URL}/gym/${g.slug}` },
    ],
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(first.address)}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="max-w-[1080px] mx-auto px-5 pt-6 text-sm text-dim">
        <Link href="/open-mats" className="hover:text-accent">Open mats</Link>
        {stateName && (
          <>
            {" › "}
            <Link href={`/open-mats/state/${stateSlug(g.state)}`} className="hover:text-accent">{stateName}</Link>
          </>
        )}
        {" › "}
        <Link href={`/open-mats/${g.citySlug}`} className="hover:text-accent">{g.city}</Link>
      </nav>

      <ListingsApp
        initialListings={g.listings}
        scope={{ country: g.country, state: g.state, city: g.city, name: g.name }}
        title={`${g.name} open mats`}
        intro={describe(g)}
      >
        <section className="py-6 border-t border-border">
          <h2 className="text-xl mb-3">About {g.name}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm max-w-[640px]">
            <dt className="text-dim">Address</dt>
            <dd>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                {first.address}
              </a>
            </dd>
            {phone && (
              <>
                <dt className="text-dim">Phone</dt>
                <dd>
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-accent hover:underline">{phone}</a>
                </dd>
              </>
            )}
            {website && (
              <>
                <dt className="text-dim">Website</dt>
                <dd>
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
                    {websiteLabel(website)}
                  </a>
                </dd>
              </>
            )}
            <dt className="text-dim">Location</dt>
            <dd>{g.place}</dd>
          </dl>
          <p className="text-sm text-dim mt-4 max-w-[65ch]">
            Open mat times change — tap a session above to see details, leave a review, or report a change so the
            schedule stays accurate for everyone. Looking for more places to roll?{" "}
            <Link href={`/open-mats/${g.citySlug}`} className="text-accent font-semibold hover:underline">
              See all open mats in {g.city}
            </Link>
            .
          </p>
        </section>
      </ListingsApp>
    </>
  );
}
