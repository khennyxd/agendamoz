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
        navy: {
          950: "#000000",
          900: "#0a0f1e",
          800: "#111c35",
          700: "#162040",
          600: "#1a2550",
        },
        royal: {
          600: "#1540b0",
          500: "#1d4ed8",
          400: "#3b6ef0",
          300: "#6b93f5",
        },
        sky: {
          300: "#93c5fd",
          200: "#bfdbfe",
          100: "#dbeafe",
        },
        amber: {
          500: "#f59e0b",
          400: "#fbbf24",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body:    ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up":  "fadeUp 0.6s ease forwards",
        "fade-in":  "fadeIn 0.4s ease forwards",
        "slide-in": "slideIn 0.4s ease forwards",
        "float-slow":   "floatSlow 8s ease-in-out infinite",
        "float-medium": "floatMedium 10s ease-in-out infinite",
        "pulse-glow":   "pulseGlow 3s ease-in-out infinite",
        "shimmer":      "shimmer 4s linear infinite",
      },
      keyframes: {
        fadeUp:      { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn:      { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideIn:     { "0%": { opacity: "0", transform: "translateX(-20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        floatSlow:   { "0%,100%": { transform: "translateY(0px) scale(1)" }, "50%": { transform: "translateY(-20px) scale(1.05)" } },
        floatMedium: { "0%,100%": { transform: "translateY(0) translateX(0)" }, "33%": { transform: "translateY(-15px) translateX(10px)" }, "66%": { transform: "translateY(10px) translateX(-8px)" } },
        pulseGlow:   { "0%,100%": { opacity: "0.4" }, "50%": { opacity: "0.8" } },
        shimmer:     { "0%": { backgroundPosition: "-200% center" }, "100%": { backgroundPosition: "200% center" } },
      },
    },
  },
  plugins: [],
};

export default config;
