import Link from "next/link";
import type { CityGroup } from "@/lib/cities";

/** Server-rendered list of city pages — gives visitors and search engines a way in. */
export default function CityLinks({ cities, heading = "Browse open mats by city" }: { cities: CityGroup[]; heading?: string }) {
  if (cities.length === 0) return null;
  return (
    <section className="py-6 border-t border-border">
      <h2 className="text-xl mb-3">{heading}</h2>
      <ul className="flex flex-wrap gap-2">
        {cities.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/open-mats/${c.slug}`}
              className="inline-block rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
            >
              {c.label}{" "}
              <span className="text-dim">({c.listings.length})</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
