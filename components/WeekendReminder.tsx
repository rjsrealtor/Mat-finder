"use client";

import { useEffect, useState } from "react";
import { canScheduleReminders, enableWeekendReminder } from "@/lib/native";

const KEY = "matfinder:weekend-reminder"; // "on" | "dismissed"

function read() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(v: string) {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
}

/** In-app card offering a Friday reminder about weekend open mats (iPhone app only). */
export default function WeekendReminder() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setShow(canScheduleReminders() && !read());
  }, []);

  if (!show && !note) return null;

  async function turnOn() {
    setBusy(true);
    const ok = await enableWeekendReminder().catch(() => false);
    setBusy(false);
    write(ok ? "on" : "dismissed");
    setShow(false);
    setNote(ok ? "Done — you'll get a reminder every Friday at 5 PM." : "No problem. You can turn notifications on later in iPhone Settings.");
  }

  if (note) return <p className="text-sm text-dim mb-4">{note}</p>;

  return (
    <div className="mb-5 rounded-xl border border-border bg-surface2 p-4 flex flex-wrap items-center gap-3">
      <p className="text-sm flex-1 min-w-[200px]">
        <span className="font-semibold">Want a heads-up for the weekend?</span> Get a reminder every Friday to check
        open mats near you.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            write("dismissed");
            setShow(false);
          }}
          className="text-sm text-dim hover:text-ink px-3 py-1.5"
        >
          No thanks
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={turnOn}
          className="rounded-lg bg-accent text-accentInk font-semibold px-3 py-1.5 text-sm disabled:opacity-60"
        >
          Remind me
        </button>
      </div>
    </div>
  );
}
