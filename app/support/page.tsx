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
      <section id="community-guidelines" className="mt-10">
        <h2 className="text-xl mb-2">Community guidelines</h2>
        <p className="text-sm text-dim mb-2">
          Listings and reviews are written by the grappling community. To keep Mat Finder useful and respectful, don&apos;t post:
        </p>
        <ul className="list-disc pl-5 text-sm text-dim flex flex-col gap-1">
          <li>Harassment, hate speech, threats, or personal attacks</li>
          <li>Sexual, violent, or otherwise objectionable content</li>
          <li>Spam, advertising, or fake listings and reviews</li>
          <li>Other people&apos;s private information</li>
        </ul>
        <p className="text-sm text-dim mt-2">
          There&apos;s zero tolerance for abusive content. Tap &ldquo;Block user&rdquo; on a review to hide that person&apos;s reviews right away, or &ldquo;Report review&rdquo; to flag it to us — we
          review reports within 24 hours, remove content that breaks these rules, and remove accounts that post it.
        </p>
      </section>

      <p className="text-sm text-dim mt-10">
        <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
      </p>
    </div>
  );
}
