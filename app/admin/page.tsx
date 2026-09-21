"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PendingReport = {
  id: string;
  type: "closed" | "members_only" | "correction";
  payload: { day?: string; time?: string; fee_note?: string } | null;
  note: string | null;
  created_at: string;
  listings: { name: string; city: string; state: string } | null;
  profiles: { display_name: string | null } | null;
};

const TYPE_LABEL: Record<string, string> = {
  closed: "No longer offered",
  members_only: "Members only",
  correction: "Day / time / fee change",
};

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
