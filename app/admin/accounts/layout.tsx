import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounts — Mat Finder admin",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
