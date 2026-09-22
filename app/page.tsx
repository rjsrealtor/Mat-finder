import type { Metadata } from "next";
import ListingsApp from "@/components/ListingsApp";
import CityLinks from "@/components/CityLinks";
import { fetchAllListings } from "@/lib/supabase/public";
import { groupByCity, isVisitable } from "@/lib/cities";

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

  return (
    <ListingsApp initialListings={listings}>
      <CityLinks cities={cities} />
    </ListingsApp>
  );
}
