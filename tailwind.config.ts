import type { Config } from "tailwindcss";

/**
 * The design system, previously an inline `tailwind.config` object in
 * index.html alongside a CDN build.
 *
 * Note the namespacing: the old config set `colors: { lime, border, muted }`,
 * which REPLACED Tailwind's own lime-50…950 scale and shadowed the default
 * border/muted colours. `bg-lime` worked but `lime-400` silently did nothing.
 * These live under their own names instead, leaving the defaults intact.
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Named after their role in the interface, not their hue, so a palette
        // change doesn't leave every class lying about its colour.
        canvas: "#000000",
        sunken: "#050505",
        surface: "#111111",
        hairline: "#222222",
        ink: "#ffffff",
        subtle: "#666666",
        acid: "#d4ff00",
      },
      fontSize: {
        micro: ["10px", { lineHeight: "1.4", letterSpacing: "0.05em" }],
        body: ["13px", { lineHeight: "1.5" }],
        lead: ["16px", { lineHeight: "1.45" }],
        title: ["24px", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        display: ["40px", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        // The brutalist direction is square by design; this keeps that explicit
        // rather than leaving stray rounded-* classes to contradict it.
        none: "0px",
      },
      boxShadow: {
        hard: "4px 4px 0 rgba(255, 255, 255, 0.1)",
        acid: "4px 4px 0 #d4ff00",
        "hard-sm": "2px 2px 0 #222222",
        "hard-lg": "8px 8px 0 #222222",
      },
      transitionDuration: {
        fast: "100ms",
      },
      zIndex: {
        // Replaces the magic z-[5001]/[5000]/[4000]/[3000]/[2000]/[1000] values.
        canvas: "10",
        overlay: "1000",
        panel: "2000",
        modal: "3000",
        nav: "4000",
        sidebar: "5000",
        tabbar: "5001",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
