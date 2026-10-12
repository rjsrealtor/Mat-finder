"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/cities";

/** "Find our open mat on Mat Finder" badge that gym owners can paste on their own site. */
export default function GymBadge({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const pageUrl = `${SITE_URL}/gym/${slug}`;
  const code = `<a href="${pageUrl}" target="_blank" rel="noopener"><img src="${SITE_URL}/badge.svg" alt="Find our open mat on Mat Finder" width="240" height="64"></a>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <section id="badge" className="py-6 border-t border-border scroll-mt-20">
      <h2 className="text-xl mb-1">Run {name}?</h2>
      <p className="text-sm text-dim mb-4 max-w-[65ch]">
        Add this free badge to your website so visitors can see your open mat times. Copy the code and paste it
        anywhere on your site (Wix, Squarespace and WordPress all have an &ldquo;HTML&rdquo; or &ldquo;Embed&rdquo;
        block).
      </p>
      <a href={pageUrl} className="inline-block mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badge.svg" alt="Find our open mat on Mat Finder" width={240} height={64} />
      </a>
      <div className="flex flex-col gap-2 max-w-[640px]">
        <textarea
          readOnly
          value={code}
          rows={3}
          onFocus={(e) => e.currentTarget.select()}
          className="rounded-lg border border-border bg-surface2 text-ink p-2.5 text-xs font-mono"
        />
        <button
          type="button"
          onClick={copy}
          className="self-start rounded-lg bg-accent text-accentInk font-semibold px-3 py-1.5 text-sm"
        >
          {copied ? "Copied!" : "Copy badge code"}
        </button>
      </div>
    </section>
  );
}
