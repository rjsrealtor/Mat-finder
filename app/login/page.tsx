"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Picked up by the handle_new_user trigger to fill profiles.display_name.
          data: { display_name: displayName.trim() },
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("signin");
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-5 py-14">
      <h1 className="text-2xl mb-1">{mode === "signin" ? "Sign in" : "Create an account"}</h1>
      <p className="text-dim text-sm mb-6">
        {mode === "signin"
          ? "Sign in to add open mats, rate them, or report changes."
          : "Free account — used to add listings, rate mats, and (soon) manage payments."}
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        {mode === "signup" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="displayName" className="text-xs font-semibold text-dim uppercase tracking-wide">
              Display name
            </label>
            <input
              id="displayName"
              required
              minLength={2}
              maxLength={30}
              placeholder="Shown on your reviews"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-lg border border-border bg-surface text-ink p-2.5 text-sm"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs font-semibold text-dim uppercase tracking-wide">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-surface text-ink p-2.5 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs font-semibold text-dim uppercase tracking-wide">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-surface text-ink p-2.5 text-sm"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {notice && <p className="text-sm text-accent">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent text-accentInk font-semibold py-2.5 text-sm mt-1 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setNotice(null);
        }}
        className="text-sm text-dim hover:text-ink mt-4"
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
