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

type NativeLocalNotifications = {
  requestPermissions: () => Promise<{ display: string }>;
  schedule: (opts: {
    notifications: {
      id: number;
      title: string;
      body: string;
      schedule: { on: { weekday: number; hour: number; minute: number }; allowWhileIdle?: boolean };
    }[];
  }) => Promise<unknown>;
  cancel: (opts: { notifications: { id: number }[] }) => Promise<void>;
};

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: {
    Geolocation?: NativeGeolocation;
    InAppReview?: { requestReview: () => Promise<void> };
    LocalNotifications?: NativeLocalNotifications;
  };
};

function capacitor(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** True inside the App Store / Google Play app. */
export function isNativeApp() {
  return Boolean(capacitor()?.isNativePlatform?.());
}

/** True in an app build that has Apple's / Google's native rating prompt (build 4+). */
export function canRequestReview() {
  return isNativeApp() && Boolean(capacitor()?.Plugins?.InAppReview);
}

/** Shows the native "Enjoying Mat Finder?" star prompt. The OS decides whether it actually appears. */
export async function requestReview() {
  await capacitor()?.Plugins?.InAppReview?.requestReview();
}

const WEEKEND_REMINDER_ID = 1001;

/** True in an app build that can schedule local notifications (build 5+). */
export function canScheduleReminders() {
  return isNativeApp() && Boolean(capacitor()?.Plugins?.LocalNotifications);
}

/**
 * Weekly "weekend open mats near you" reminder, Fridays at 5 PM local time.
 * Local notification only — nothing is sent from a server. Returns false if
 * the user declined notification permission.
 */
export async function enableWeekendReminder() {
  const ln = capacitor()?.Plugins?.LocalNotifications;
  if (!ln) return false;
  const { display } = await ln.requestPermissions();
  if (display !== "granted") return false;
  await ln.cancel({ notifications: [{ id: WEEKEND_REMINDER_ID }] }).catch(() => {});
  await ln.schedule({
    notifications: [
      {
        id: WEEKEND_REMINDER_ID,
        title: "Weekend open mats near you",
        body: "See who's rolling Saturday and Sunday — tap to find an open mat.",
        // Capacitor weekdays: 1 = Sunday … 6 = Friday
        schedule: { on: { weekday: 6, hour: 17, minute: 0 }, allowWhileIdle: true },
      },
    ],
  });
  return true;
}

export async function disableWeekendReminder() {
  await capacitor()?.Plugins?.LocalNotifications?.cancel({ notifications: [{ id: WEEKEND_REMINDER_ID }] });
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
