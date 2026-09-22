import type { Metadata } from "next";
import { Oswald, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SITE_URL } from "@/lib/cities";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-worksans",
});

const description =
  "Find and add free Brazilian Jiu-Jitsu open mats near you — filter by day, gi/no-gi, price and rating, crowd-verified by the grappling community.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mat Finder — free BJJ open mats near you",
  description,
  openGraph: {
    type: "website",
    siteName: "Mat Finder",
    title: "Mat Finder — free BJJ open mats near you",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Mat Finder — free BJJ open mats near you",
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${workSans.variable}`}>
      <body className="font-[family-name:var(--font-worksans)] min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
