"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/native";
import { APP_STORE_REVIEW_URL, noteAppOpen } from "@/lib/review";

/** Counts app opens for the rating prompt (see lib/review.ts). */
export function AppOpenTracker() {
  useEffect(() => noteAppOpen(), []);
  return null;
}

/** Footer link to the App Store review page — only inside the iPhone app. */
export function RateAppLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const cap = (window as Window & { Capacitor?: { getPlatform?: () => string } }).Capacitor;
    setShow(isNativeApp() && cap?.getPlatform?.() === "ios");
  }, []);
  if (!show) return null;
  return (
    <a href={APP_STORE_REVIEW_URL} target="_blank" rel="noopener" className="hover:text-ink">
      Rate the app
    </a>
  );
}
