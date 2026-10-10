"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Account = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Admin-only list of every account (see supabase/admin-accounts.sql). */
export default function AccountsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase.rpc("admin_list_accounts");
      if (error) setError(error.message.includes("Admins only") ? "This page is for admins only." : error.message);
      else setAccounts((data ?? []) as Account[]);
    }
    load();
  }, [supabase, router]);

  if (error) return <p className="max-w-[720px] mx-auto px-5 py-14 text-sm text-danger">{error}</p>;
  if (!accounts) return <p className="max-w-[720px] mx-auto px-5 py-14 text-dim text-sm">Loading…</p>;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = accounts.filter((a) => new Date(a.created_at).getTime() > weekAgo).length;

  return (
    <div className="max-w-[720px] mx-auto px-5 py-14">
      <h1 className="text-2xl mb-1">Accounts</h1>
      <p className="text-dim text-sm mb-6">
        {accounts.length} total · {thisWeek} new in the last 7 days
      </p>

      <ul className="divide-y divide-border border border-border rounded-lg">
        {accounts.map((a) => (
          <li key={a.id} className="p-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{a.display_name || "—"}</p>
              <p className="text-xs text-dim truncate">
                {a.email}
                {!a.confirmed && " · email not confirmed"}
              </p>
            </div>
            <p className="text-xs text-dim">
              Joined {fmt(a.created_at)} · Last sign-in {fmt(a.last_sign_in_at)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
