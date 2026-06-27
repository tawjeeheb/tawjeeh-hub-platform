import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        // Brand lock — these three brand colors only, on white / off-white.
        navy: {
          DEFAULT: "#023663",
          50: "#eef4fa",
          100: "#d4e2f0",
          600: "#023663",
          700: "#022a4d",
          900: "#011a30",
        },
        teal: {
          DEFAULT: "#049e9e",
          50: "#e8f7f7",
          100: "#c5ecec",
          600: "#049e9e",
          700: "#037e7e",
        },
        plum: {
          DEFAULT: "#5e4360",
          50: "#f1edf1",
          100: "#ddd3de",
          600: "#5e4360",
          700: "#4a3550",
        },
        offwhite: "#f7f9fb",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Restrained, refined, layered shadows — depth without heaviness.
        card: "0 1px 3px rgba(2, 54, 99, 0.05)",
        soft: "0 1px 2px rgba(2, 54, 99, 0.04), 0 8px 24px rgba(2, 54, 99, 0.06)",
        elev: "0 2px 4px rgba(2, 54, 99, 0.04), 0 18px 40px -12px rgba(2, 54, 99, 0.18)",
        glow: "0 20px 60px -24px rgba(4, 158, 158, 0.45)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #023663 0%, #049e9e 60%, #5e4360 100%)",
        "navy-sheen":
          "linear-gradient(160deg, #023663 0%, #04335f 45%, #06324f 100%)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.6s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
