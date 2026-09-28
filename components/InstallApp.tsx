"use client";

import { useEffect, useState } from "react";

// Chrome/Edge/Android fire this with a prompt() we can trigger from our own button.
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (ua.includes("Mac") && "ontouchend" in document)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Install button (when the browser supports it) plus step-by-step instructions per platform. */
export default function InstallApp() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [installed, setInstalled] = useState(false);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  if (installed) {
    return (
      <p className="rounded-card border border-border bg-surface p-4 text-sm">
        ✅ Mat Finder is installed on this device. Open it from your home screen anytime.
      </p>
    );
  }

  const steps: Record<Platform, { title: string; items: string[] }> = {
    ios: {
      title: "iPhone & iPad (Safari)",
      items: [
        "Open www.matfinderbjj.com in Safari.",
        "Tap the Share button (the square with an arrow pointing up) at the bottom of the screen.",
        "Scroll down and tap “Add to Home Screen”.",
        "Tap “Add”. Mat Finder now has its own icon on your home screen.",
      ],
    },
    android: {
      title: "Android (Chrome)",
      items: [
        "Open www.matfinderbjj.com in Chrome.",
        "Tap the ⋮ menu in the top-right corner.",
        "Tap “Install app” (or “Add to Home screen”).",
        "Tap “Install”. Mat Finder now has its own icon on your home screen.",
      ],
    },
    desktop: {
      title: "Computer (Chrome or Edge)",
      items: [
        "Open www.matfinderbjj.com in Chrome or Edge.",
        "Click the install icon at the right end of the address bar (a screen with a down arrow).",
        "Click “Install”.",
      ],
    },
  };
  const order: Platform[] = platform ? [platform, ...(["ios", "android", "desktop"] as Platform[]).filter((p) => p !== platform)] : ["ios", "android", "desktop"];

  return (
    <div className="flex flex-col gap-6">
      {prompt && (
        <button
          onClick={install}
          className="self-start rounded-full bg-accent text-accentInk font-semibold px-6 py-3 text-base"
        >
          Install Mat Finder
        </button>
      )}
      {order.map((p, i) => (
        <section key={p} className={i === 0 ? "" : "opacity-80"}>
          <h2 className="text-lg mb-2">
            {steps[p].title}
            {i === 0 && platform && <span className="text-xs text-accent font-semibold ml-2">← your device</span>}
          </h2>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5 text-sm">
            {steps[p].items.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
