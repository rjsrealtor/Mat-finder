// Decides when to show the native rating prompt in the app. Apple requires its
// own prompt (no custom "rate us" popups), shows it at most 3 times a year, and
// may skip it — so we only ask regulars, after they've looked at a mat.

import { canRequestReview, requestReview } from "@/lib/native";

const DAYS_KEY = "matfinder:open-days";
const ASKED_KEY = "matfinder:review-asked";
const MIN_DAYS = 3; // different days the app has been opened
const REASK_DAYS = 120;

export const APP_STORE_REVIEW_URL = "https://apps.apple.com/app/id6817913033?action=write-review";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** Records that the app was opened today. */
export function noteAppOpen() {
  if (!canRequestReview()) return;
  const today = new Date().toISOString().slice(0, 10);
  const days = read<string[]>(DAYS_KEY, []);
  if (!days.includes(today)) write(DAYS_KEY, [...days, today].slice(-10));
}

/** Call after a good moment (closing a mat's details). Asks at most once per REASK_DAYS. */
export function maybeAskForReview() {
  if (!canRequestReview()) return;
  if (read<string[]>(DAYS_KEY, []).length < MIN_DAYS) return;
  const last = read<number>(ASKED_KEY, 0);
  if (Date.now() - last < REASK_DAYS * 24 * 60 * 60 * 1000) return;
  write(ASKED_KEY, Date.now());
  // Let the details sheet finish closing first.
  setTimeout(() => requestReview().catch(() => {}), 600);
}
