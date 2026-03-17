import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg0: "var(--bg-0)",
        bg1: "var(--bg-1)",
        bg2: "var(--bg-2)",
        fg0: "var(--fg-0)",
        fg1: "var(--fg-1)",
        accent: "var(--accent-500)",
        accentSoft: "var(--accent-200)",
      },
      fontFamily: {
        satoshi: ["Satoshi", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 12px 30px rgba(0,0,0,0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
