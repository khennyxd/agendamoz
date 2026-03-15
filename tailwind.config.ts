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
        teal: {
          900: "#0a3840",
          800: "#0D4F5C",
          700: "#116070",
          600: "#147a8a",
          400: "#2da8c0",
          100: "#d0f0f7",
          50:  "#ebfafc",
        },
        amber: {
          500: "#F5A623",
          400: "#f7b84b",
          300: "#f9ca72",
          100: "#fef3d6",
        },
        cream: "#FAF7F2",
        ink:   "#1a1a2e",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body:    ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease forwards",
        "fade-in":   "fadeIn 0.4s ease forwards",
        "slide-in":  "slideIn 0.4s ease forwards",
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
