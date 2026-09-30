// Bridges to the iOS / Android app (Capacitor shell in /mobile). When the site
// runs inside the app, Capacitor injects window.Capacitor with the native
// plugins; in a normal browser these helpers fall back to web APIs.

import type { LatLng } from "@/lib/geo";

type NativeGeolocation = {
  checkPermissions: () => Promise<{ location: string }>;
  requestPermissions: () => Promise<{ location: string }>;
  getCurrentPosition: (opts?: { enableHighAccuracy?: boolean; timeout?: number }) => Promise<{
    coords: { latitude: number; longitude: number };
  }>;
};

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: { Geolocation?: NativeGeolocation };
};

function capacitor(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** True inside the App Store / Google Play app. */
export function isNativeApp() {
  return Boolean(capacitor()?.isNativePlatform?.());
}

export class LocationDeniedError extends Error {}

/** The visitor's location — native GPS in the app, browser geolocation on the web. */
export async function getLocation(): Promise<LatLng> {
  const geo = capacitor()?.Plugins?.Geolocation;
  if (isNativeApp() && geo) {
    let { location } = await geo.checkPermissions();
    if (location === "prompt" || location === "prompt-with-rationale") ({ location } = await geo.requestPermissions());
    if (location === "denied") throw new LocationDeniedError();
    const pos = await geo.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000 });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  }

  if (!("geolocation" in navigator)) throw new Error("Geolocation unavailable");
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err.code === err.PERMISSION_DENIED ? new LocationDeniedError() : new Error(err.message)),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 }
    )
  );
}
