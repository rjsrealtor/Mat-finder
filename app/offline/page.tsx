import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline | Mat Finder", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="max-w-[420px] mx-auto px-5 py-16 text-center">
      <h1 className="text-2xl mb-2">You&apos;re offline</h1>
      <p className="text-dim text-sm">
        Mat Finder needs an internet connection to load open mats. Check your signal and try again.
      </p>
      <a href="/" className="inline-block mt-6 bg-accent text-accentInk rounded-full px-5 py-2 text-sm font-semibold">
        Try again
      </a>
    </div>
  );
}
