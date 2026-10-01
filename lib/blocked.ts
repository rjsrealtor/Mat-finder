// Users a visitor has blocked. Their reviews are hidden for that visitor
// (App Store guideline 1.2: apps with user-generated content must let people
// block abusive users). Stored per device, so it works without signing in.

const KEY = "matfinder:blockedUsers";

export function getBlocked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setBlocked(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // Storage unavailable (private mode): blocking just won't persist.
  }
}

export function blockUser(id: string) {
  setBlocked([...getBlocked(), id]);
}
