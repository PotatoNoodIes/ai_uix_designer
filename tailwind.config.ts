import type { Config } from "tailwindcss";

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
