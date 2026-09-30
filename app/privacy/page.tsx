import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Privacy Policy | Mat Finder",
  description: "How Mat Finder collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "September 30, 2026";

export default function PrivacyPage() {
  return (
    <div className="max-w-[720px] mx-auto px-5 py-10 sm:py-14 text-sm leading-relaxed">
      <h1 className="text-3xl mb-1">Privacy Policy</h1>
      <p className="text-dim mb-8">Last updated {UPDATED}</p>

      <div className="flex flex-col gap-6 [&_h2]:text-lg [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
        <section>
          <p>
            Mat Finder (&ldquo;we&rdquo;) runs the website www.matfinderbjj.com and the Mat Finder apps for iPhone and
            Android. This policy explains what information we collect and how we use it. Mat Finder is free, has no
            ads, and we never sell your information.
          </p>
        </section>

        <section>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Account details</strong> — if you create an account: your email address, a password (stored
              encrypted by our authentication provider), and the display name you choose.
            </li>
            <li>
              <strong>What you contribute</strong> — open mats you add or edit, ratings and reviews, and reports you
              submit. Listings and reviews are public; your display name is shown next to your reviews. Your email
              address is never shown publicly.
            </li>
            <li>
              <strong>Location (only when you ask)</strong> — when you tap &ldquo;Near me&rdquo;, your device shares
              your approximate location so Mat Finder can sort open mats by distance. This happens on your device: your
              location is not sent to or stored on our servers.
            </li>
            <li>
              <strong>Basic technical data</strong> — like any website, our hosting provider automatically logs
              information such as IP address, browser type and pages requested, for security and to keep the service
              running.
            </li>
          </ul>
          <p className="mt-2">We don&apos;t use advertising, analytics or tracking tools, and we don&apos;t track you across other apps or websites.</p>
        </section>

        <section>
          <h2>How we use it</h2>
          <ul>
            <li>To run Mat Finder: show listings, let you add and review open mats, and keep listings accurate.</li>
            <li>To send account emails, such as confirming your email address.</li>
            <li>To prevent spam and abuse.</li>
          </ul>
        </section>

        <section>
          <h2>Who we share it with</h2>
          <p>
            Only the service providers that run Mat Finder for us: Supabase (database and accounts), Vercel (website
            hosting), and Resend (account emails). Gym addresses you enter are sent to the US Census Bureau and
            OpenStreetMap geocoding services to find their map location. We may disclose information if required by
            law.
          </p>
        </section>

        <section>
          <h2>Deleting your account</h2>
          <p>
            You can delete your account at any time from the{" "}
            <Link href="/account" className="text-accent hover:underline">Account</Link> page, in the website or the
            app. This permanently removes your account, display name, ratings, reviews and reports. Open mats you added
            stay listed (without your name) because other people rely on them. You can also email us to ask for
            deletion.
          </p>
        </section>

        <section>
          <h2>Children</h2>
          <p>Mat Finder is not directed to children under 13, and we don&apos;t knowingly collect their information.</p>
        </section>

        <section>
          <h2>Changes and contact</h2>
          <p>
            If we change this policy we&apos;ll update the date above. Questions or requests:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
