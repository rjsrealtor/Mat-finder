import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Support | Mat Finder",
  description: "Get help with Mat Finder — fixing a listing, your account, or the app.",
  alternates: { canonical: "/support" },
};

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "An open mat is wrong or no longer running. How do I fix it?",
    a: "Open the listing and tap “Report a change”. You can mark it closed, members-only, or update the day, time or fee.",
  },
  {
    q: "How do I add an open mat?",
    a: (
      <>
        <Link href="/login" className="text-accent hover:underline">Sign in</Link> (it&apos;s free), then tap
        “+ Add open mat” on the home page.
      </>
    ),
  },
  {
    q: "“Near me” isn't working.",
    a: "Mat Finder needs permission to use your location. On iPhone: Settings → Mat Finder (or Safari) → Location → While Using. On Android: Settings → Apps → Mat Finder → Permissions → Location.",
  },
  {
    q: "How do I change my display name or delete my account?",
    a: (
      <>
        Go to your <Link href="/account" className="text-accent hover:underline">Account</Link> page.
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-[720px] mx-auto px-5 py-10 sm:py-14">
      <h1 className="text-3xl mb-2">Support</h1>
      <p className="text-dim mb-8">
        Questions, problems, or a gym that wants its listing updated? Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a> and we&apos;ll get
        back to you.
      </p>
      <div className="flex flex-col gap-5">
        {FAQ.map((f) => (
          <div key={f.q}>
            <h2 className="text-base font-semibold">{f.q}</h2>
            <p className="text-sm text-dim mt-1">{f.a}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-dim mt-10">
        <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
      </p>
    </div>
  );
}
