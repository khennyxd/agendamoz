import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#02020a",
          900: "#05050f",
          800: "#0a0a1a",
          700: "#0f0f24",
          600: "#14142e",
          500: "#1a1a3e",
        },
        cyan: {
          400: "#00e5ff",
          500: "#00bcd4",
          600: "#0097a7",
          300: "#4af0ff",
          100: "#e0fcff",
          50:  "#f0feff",
        },
        violet: {
          900: "#1e0a3c",
          800: "#2d1160",
          700: "#3d1880",
          600: "#5b21b6",
          500: "#7c3aed",
          400: "#a78bfa",
          300: "#c4b5fd",
        },
        gold: {
          500: "#f59e0b",
          400: "#fbbf24",
          300: "#fcd34d",
        },
        surface: {
          DEFAULT: "#0a0a1a",
          2: "#0f0f24",
          3: "#14142e",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "Georgia", "serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
        "glow-cyan":  "radial-gradient(ellipse at center, rgba(0,229,255,0.15) 0%, transparent 70%)",
        "glow-violet":"radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid-40": "40px 40px",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow":       "glow 2s ease-in-out infinite alternate",
        "float":      "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:  { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        glow:    { "0%": { boxShadow: "0 0 20px rgba(0,229,255,0.3)" }, "100%": { boxShadow: "0 0 40px rgba(0,229,255,0.6), 0 0 80px rgba(0,229,255,0.2)" } },
        float:   { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      boxShadow: {
        "cyan-sm":  "0 0 10px rgba(0,229,255,0.2)",
        "cyan-md":  "0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(0,229,255,0.1)",
        "cyan-lg":  "0 0 40px rgba(0,229,255,0.4), 0 0 80px rgba(0,229,255,0.15)",
        "violet-sm":"0 0 10px rgba(124,58,237,0.3)",
        "violet-md":"0 0 20px rgba(124,58,237,0.4), 0 0 40px rgba(124,58,237,0.15)",
      },
      borderColor: {
        "cyber": "rgba(0,229,255,0.15)",
        "cyber-bright": "rgba(0,229,255,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
