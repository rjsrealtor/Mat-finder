import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-8">
      <div className="max-w-[1080px] mx-auto px-5 py-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-dim">
        <span>© {new Date().getFullYear()} Mat Finder</span>
        <Link href="/open-mats" className="hover:text-ink">Open mats by city</Link>
        <Link href="/support" className="hover:text-ink">Support</Link>
        <Link href="/privacy" className="hover:text-ink">Privacy</Link>
      </div>
    </footer>
  );
}
