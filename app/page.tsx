import type { Metadata } from "next";
import ListingsApp from "@/components/ListingsApp";
import CityLinks from "@/components/CityLinks";
import { fetchAllListings } from "@/lib/supabase/public";
import { groupByCity, isVisitable, SITE_URL } from "@/lib/cities";

// Re-fetch listings from Supabase at most every 5 minutes; a new listing
// still shows right away for the person who added it (the client reloads).
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function HomePage() {
  const listings = await fetchAllListings();
  const cities = groupByCity(listings.filter(isVisitable));

  // Structured data so search engines know the site's name and who runs it.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Mat Finder",
        alternateName: ["BJJ Open Mat Finder", "matfinderbjj.com"],
        url: SITE_URL,
      },
      {
        "@type": "Organization",
        name: "Mat Finder",
        url: SITE_URL,
        logo: `${SITE_URL}/icons/icon-512.png`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ListingsApp initialListings={listings}>
        <CityLinks cities={cities} />
      </ListingsApp>
    </>
  );
}
