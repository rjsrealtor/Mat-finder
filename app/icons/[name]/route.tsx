import { ImageResponse } from "next/og";
import { AppIcon } from "@/lib/brand";

// Icons referenced by app/manifest.ts: /icons/icon-192.png, /icons/icon-512.png,
// /icons/maskable-512.png (extra padding so Android launchers can crop it).
const ICONS: Record<string, { size: number; padding?: number; background?: string }> = {
  "icon-192.png": { size: 192 },
  "icon-512.png": { size: 512 },
  "maskable-512.png": { size: 512, padding: 0.2 },
  // Source art for the iOS / Android app icons and launch screens (mobile/assets).
  "icon-1024.png": { size: 1024, padding: 0.06 },
  "splash-2732.png": { size: 2732, padding: 0.4, background: "#ffffff" },
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

export function GET(_req: Request, { params }: { params: { name: string } }) {
  const icon = ICONS[params.name];
  if (!icon) return new Response("Not found", { status: 404 });
  return new ImageResponse(<AppIcon size={icon.size} padding={icon.padding} background={icon.background} />, {
    width: icon.size,
    height: icon.size,
  });
}
