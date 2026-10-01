import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ListingsApp from "@/components/ListingsApp";
import CityLinks from "@/components/CityLinks";
import { fetchAllListings } from "@/lib/supabase/public";
import { SITE_URL, groupByCity, groupByGym, isVisitable, stateSlug, type CityGroup } from "@/lib/cities";
import { STATE_NAMES } from "@/lib/us-states";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function list(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Short Q&A built from this city's actual listings, so each city page has its own useful text. */
function faqs(c: CityGroup): { q: string; a: string }[] {
  const open = c.listings.filter(isVisitable);
  if (open.length === 0) return [];
  const gyms = groupByGym(open);
  const days = DAY_ORDER.filter((d) => open.some((l) => l.day === d));
  const weekend = open.filter((l) => l.day === "Saturday" || l.day === "Sunday");
  const free = gyms.filter((g) => g.listings.some((l) => l.fee_cents === 0));
  const paid = open.filter((l) => typeof l.fee_cents === "number" && l.fee_cents > 0);
  const nogi = gyms.filter((g) => g.listings.some((l) => l.gi === "nogi" || l.gi === "gi_nogi"));
  const out: { q: string; a: string }[] = [];

  out.push({
    q: `Where can I find a BJJ open mat in ${c.city}?`,
    a: `Mat Finder lists ${open.length === 1 ? "1 open mat" : `${open.length} open mats`} at ${gyms.length === 1 ? "1 gym" : `${gyms.length} gyms`} in ${c.label}: ${list(gyms.slice(0, 6).map((g) => g.name))}${gyms.length > 6 ? " and more" : ""}.`,
  });
  if (days.length) {
    out.push({
      q: `What days are there open mats in ${c.city}?`,
      a: `Open mats in ${c.city} run on ${list(days)}.${weekend.length ? ` ${weekend.length === 1 ? "One is" : `${weekend.length} are`} on the weekend.` : ""}`,
    });
  }
  out.push({
    q: `Are open mats in ${c.city} free?`,
    a: free.length
      ? `${list(free.slice(0, 4).map((g) => g.name))} ${free.length === 1 ? "lists a free open mat" : "list free open mats"}.${paid.length ? " Others charge a drop-in fee — check each listing." : ""} Fees change, so confirm with the gym before you go.`
      : `Most gyms here don't post a price — drop-in fees for open mats are typically $0–$30. Check each listing and confirm with the gym before you go.`,
  });
  if (nogi.length) {
    out.push({
      q: `Are there no-gi open mats in ${c.city}?`,
      a: `Yes — ${list(nogi.slice(0, 4).map((g) => g.name))} ${nogi.length === 1 ? "offers" : "offer"} no-gi (or gi and no-gi) open mats.`,
    });
  }
  out.push({
    q: "What should I bring to an open mat as a visitor?",
    a: "Bring a clean gi and/or rash guard and shorts, a water bottle, and flip-flops for off the mat. Expect to sign a waiver, and it's good etiquette to check the gym's visitor policy (some require a minimum rank or experience) before showing up.",
  });
  return out;
}

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
  return `${count} in ${c.label}${days ? ` — ${days}` : ""}. Jiu-jitsu open mat days, times, gi or no-gi, drop-in fees and visitor rules, kept up to date by local grapplers.`;
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const found = await getCity(params.city);
  if (!found) return { title: "City not found | Mat Finder" };
  const { city } = found;
  const title = `BJJ & Jiu-Jitsu Open Mats in ${city.label} | Mat Finder`;
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
  const qa = faqs(city);
  const gyms = groupByGym(city.listings.filter(isVisitable));
  const stateName = city.country === "US" ? STATE_NAMES[city.state.trim().toUpperCase()] : null;

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

  const faqLd = qa.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: qa.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      )}
      <nav aria-label="Breadcrumb" className="max-w-[1080px] mx-auto px-5 pt-6 text-sm text-dim">
        <Link href="/open-mats" className="hover:text-accent">Open mats</Link>
        {stateName && (
          <>
            {" › "}
            <Link href={`/open-mats/state/${stateSlug(city.state)}`} className="hover:text-accent">{stateName}</Link>
          </>
        )}
        {" › "}
        {city.city}
      </nav>
      <ListingsApp
        initialListings={city.listings}
        scope={{ country: city.country, state: city.state, city: city.city }}
        title={`BJJ open mats in ${city.label}`}
        intro={describe(city)}
      >
        {gyms.length > 0 && (
          <section className="py-6 border-t border-border">
            <h2 className="text-xl mb-3">Gyms with open mats in {city.city}</h2>
            <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              {gyms.map((g) => (
                <li key={g.slug}>
                  <Link href={`/gym/${g.slug}`} className="hover:text-accent hover:underline">{g.name}</Link>{" "}
                  <span className="text-dim">· {g.listings.map((l) => l.day).join(", ")}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {qa.length > 0 && (
          <section className="py-6 border-t border-border">
            <h2 className="text-xl mb-3">Open mats in {city.city}: common questions</h2>
            <div className="flex flex-col gap-4 max-w-[70ch]">
              {qa.map((f) => (
                <div key={f.q}>
                  <h3 className="text-base font-semibold">{f.q}</h3>
                  <p className="text-sm text-dim mt-1">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        <CityLinks cities={others} heading="Open mats in other cities" />
      </ListingsApp>
    </>
  );
}
