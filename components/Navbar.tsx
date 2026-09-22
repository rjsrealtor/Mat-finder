"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoaded(true);
      if (data.user) {
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => setIsAdmin(Boolean(profile?.is_admin)));
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setIsAdmin(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="sticky top-0 z-30 bg-bg border-b border-border">
      <div className="max-w-[1080px] mx-auto px-5 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="14" stroke="var(--accent)" strokeWidth="2" />
            <path
              d="M9 15c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6"
              stroke="var(--accent)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="15" cy="15" r="2.2" fill="var(--gold)" />
          </svg>
          <span className="display text-lg tracking-wide">Mat Finder</span>
        </Link>

        <Link href="/open-mats" className="text-sm text-dim hover:text-ink ml-auto">
          Cities
        </Link>

        {!loaded ? null : user ? (
          <div className="flex items-center gap-3 text-sm">
            {isAdmin && (
              <Link href="/admin" className="text-gold font-semibold hover:underline">
                Admin
              </Link>
            )}
            <span className="text-dim hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={signOut}
              className="border border-border rounded-lg px-3 py-1.5 text-dim hover:text-ink hover:border-dim transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-accent text-accentInk rounded-full px-4 py-1.5 text-sm font-semibold"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
