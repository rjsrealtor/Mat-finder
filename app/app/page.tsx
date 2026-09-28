import type { Metadata } from "next";
import InstallApp from "@/components/InstallApp";

export const metadata: Metadata = {
  title: "Get the Mat Finder App | Mat Finder",
  description: "Put Mat Finder on your home screen — find BJJ open mats near you in one tap. Free, no app store needed.",
  alternates: { canonical: "/app" },
};

export default function AppPage() {
  return (
    <div className="max-w-[640px] mx-auto px-5 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">Get the app</h1>
      <p className="text-dim mt-2 mb-8">
        Add Mat Finder to your home screen to find an open mat in one tap — it opens full-screen like any other app.
        Free, and no app store needed.
      </p>
      <InstallApp />
    </div>
  );
}
