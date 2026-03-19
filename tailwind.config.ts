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
        night: {
          950: "#050508",
          900: "#08090f",
          800: "#0c0e18",
          700: "#111422",
          600: "#161b2e",
        },
        azure: {
          900: "#0f1e3d",
          800: "#162447",
          700: "#1a2f5e",
          600: "#1e3a8a",
          500: "#1d4ed8",
          400: "#3b82f6",
          300: "#60a5fa",
          200: "#93c5fd",
          100: "#dbeafe",
        },
        amber: {
          500: "#F5A623",
          400: "#f7b84b",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body:    ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up":  "fadeUp 0.5s ease forwards",
        "fade-in":  "fadeIn 0.4s ease forwards",
        "slide-in": "slideIn 0.4s ease forwards",
      },
      keyframes: {
        fadeUp:  { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideIn: { "0%": { opacity: "0", transform: "translateX(-20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
