import type { Metadata } from "next";
import { Oswald, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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

export const metadata: Metadata = {
  title: "Mat Finder — free BJJ open mats near you",
  description:
    "Find and add free Brazilian Jiu-Jitsu open mats near you — filter by day, gi/no-gi, price and rating, crowd-verified by the grappling community.",
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
