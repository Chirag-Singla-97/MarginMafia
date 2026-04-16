import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffaf0",
          100: "#fff1d6",
          200: "#ffe0a8",
          300: "#ffc96b",
          400: "#ffa534",
          500: "#f97316",
          600: "#e15307",
          700: "#b43a0a",
          800: "#8f2e0f",
          900: "#5c1d0b",
        },
        field: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        ink: {
          50: "#f6f6f7",
          100: "#ebecee",
          200: "#d4d6da",
          300: "#a8acb4",
          400: "#6e7581",
          500: "#454b57",
          600: "#2e333c",
          700: "#1e2229",
          800: "#141820",
          900: "#0b0e14",
        },
        soil: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-grotesk)', 'var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        "glow-brand": "0 10px 40px -10px rgba(249, 115, 22, 0.4)",
        "glow-field": "0 10px 40px -10px rgba(34, 197, 94, 0.4)",
        "card": "0 1px 2px rgba(16, 24, 40, 0.04), 0 2px 6px rgba(16, 24, 40, 0.04)",
        "elev": "0 4px 12px rgba(16, 24, 40, 0.08), 0 16px 32px -12px rgba(16, 24, 40, 0.12)",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "float-slower": "float 14s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-24px) translateX(12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
