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
        purple: {
          950: "#1e0a3c",
          900: "#2d1160",
          800: "#3d1a7a",
          700: "#5b21b6",
          600: "#7c3aed",
          500: "#8b5cf6",
          400: "#a78bfa",
          300: "#c4b5fd",
          200: "#ddd6fe",
          100: "#ede9fe",
          50:  "#f5f3ff",
        },
        ink: {
          900: "#0f0a1e",
          800: "#1e1b4b",
          700: "#312e81",
          DEFAULT: "#1e1b4b",
        },
      },
      fontFamily: {
        display: ["var(--font-raleway)", "var(--font-poppins)", "system-ui", "sans-serif"],
        body:    ["var(--font-inter)", "system-ui", "sans-serif"],
        nums:    ["var(--font-inter)", "system-ui", "sans-serif"],
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
