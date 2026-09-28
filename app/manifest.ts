import type { MetadataRoute } from "next";
import { BRAND_BG } from "@/lib/brand";

// Makes the site installable ("Add to Home Screen" / "Install app").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mat Finder — BJJ Open Mats",
    short_name: "Mat Finder",
    description: "Find Brazilian Jiu-Jitsu open mats near you — days, times, gi or no-gi, drop-in fees and visitor rules.",
    id: "/",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: BRAND_BG,
    theme_color: BRAND_BG,
    categories: ["sports", "health", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
