import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        border: "var(--border)",
        ink: "var(--text)",
        dim: "var(--text-dim)",
        accent: "var(--accent)",
        accentInk: "var(--accent-ink)",
        gold: "var(--gold)",
        goldBg: "var(--gold-bg)",
        danger: "var(--danger)",
        dangerBg: "var(--danger-bg)",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "system-ui", "sans-serif"],
        body: ["var(--font-worksans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
