import { STATE_NAMES } from "@/lib/us-states";

// ISO 3166-1 alpha-2 codes offered in the "Country" picker. Names come from
// Intl.DisplayNames so they don't need to be maintained by hand.
const COUNTRY_CODES = [
  "US", "AE", "AR", "AT", "AU", "BE", "BG", "BR", "CA", "CH", "CL", "CN", "CO", "CR", "CZ", "DE",
  "DK", "DO", "EC", "EE", "EG", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HR", "HU", "ID", "IE",
  "IL", "IN", "IS", "IT", "JM", "JP", "KE", "KR", "KZ", "LT", "LV", "MA", "MX", "MY", "NG", "NL",
  "NO", "NZ", "PA", "PE", "PH", "PL", "PR", "PT", "PY", "QA", "RO", "RS", "SA", "SE", "SG", "SI",
  "SK", "TH", "TR", "TW", "UA", "UY", "VE", "VN", "ZA",
];

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string) {
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** US first, then everything else alphabetically by name. */
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: countryName("US") },
  ...COUNTRY_CODES.filter((c) => c !== "US")
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

// Default currency when a country is picked; the form still lets people change it.
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", PR: "USD", EC: "USD", PA: "USD", AE: "AED", AR: "ARS", AU: "AUD", BG: "BGN",
  BR: "BRL", CA: "CAD", CH: "CHF", CL: "CLP", CN: "CNY", CO: "COP", CR: "CRC", CZ: "CZK",
  DK: "DKK", DO: "DOP", EG: "EGP", GB: "GBP", GT: "GTQ", HK: "HKD", HU: "HUF", ID: "IDR",
  IL: "ILS", IN: "INR", IS: "ISK", JM: "JMD", JP: "JPY", KE: "KES", KR: "KRW", KZ: "KZT",
  MA: "MAD", MX: "MXN", MY: "MYR", NG: "NGN", NO: "NOK", NZ: "NZD", PE: "PEN", PH: "PHP",
  PL: "PLN", PY: "PYG", QA: "QAR", RO: "RON", RS: "RSD", SA: "SAR", SE: "SEK", SG: "SGD",
  TH: "THB", TR: "TRY", TW: "TWD", UA: "UAH", UY: "UYU", VE: "USD", VN: "VND", ZA: "ZAR",
};
const EURO = ["AT", "BE", "HR", "DE", "EE", "ES", "FI", "FR", "GR", "IE", "IT", "LT", "LV", "NL", "PT", "SI", "SK"];

export function defaultCurrency(country: string) {
  if (EURO.includes(country)) return "EUR";
  return COUNTRY_CURRENCY[country] ?? "USD";
}

export const CURRENCIES = Array.from(
  new Set(["USD", "EUR", ...Object.values(COUNTRY_CURRENCY)])
).sort();

export function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)} ${currency}`;
  }
}

type Place = { city: string; state: string; country: string };

/** "Costa Mesa, CA" in the US; "London, England, United Kingdom" elsewhere. */
export function placeLabel(p: Place) {
  if (p.country === "US") return [p.city, p.state].filter(Boolean).join(", ");
  return [p.city, p.state, countryName(p.country)].filter(Boolean).join(", ");
}

/** Words a search should match: state / country codes and full names. */
export function placeSearchText(p: Place) {
  // Includes placeLabel so picking a suggestion like "Costa Mesa, CA" matches.
  const parts = [placeLabel(p), p.city, p.state, p.country, countryName(p.country)];
  if (p.country === "US") parts.push(STATE_NAMES[p.state.trim().toUpperCase()] ?? "");
  return parts.join(" ");
}

/** Broader area a search suggestion can offer: US state name, or country name. */
export function regionLabel(p: Place) {
  if (p.country === "US") return STATE_NAMES[p.state.trim().toUpperCase()] ?? p.state;
  return countryName(p.country);
}

/** Accepts "gym.com" or a full URL; returns a URL with a scheme, or null. */
export function normalizeWebsite(raw: string) {
  const v = raw.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function websiteLabel(url: string) {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
}
