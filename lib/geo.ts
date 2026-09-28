export type LatLng = { lat: number; lng: number };

/** Straight-line distance in miles (haversine). */
export function milesBetween(a: LatLng, b: LatLng) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatMiles(mi: number) {
  if (mi < 0.95) return "under 1 mi";
  return `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
}
