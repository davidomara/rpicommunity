import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(211 77% 45%)",
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222 47% 11%)",
        primary: {
          DEFAULT: "hsl(211 77% 45%)",
          foreground: "hsl(210 40% 98%)"
        },
        secondary: {
          DEFAULT: "hsl(200 23% 92%)",
          foreground: "hsl(222 47% 11%)"
        },
        muted: {
          DEFAULT: "hsl(210 16% 93%)",
          foreground: "hsl(215 16% 40%)"
        },
        accent: {
          DEFAULT: "hsl(189 61% 88%)",
          foreground: "hsl(222 47% 11%)"
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(210 40% 98%)"
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222 47% 11%)"
        }
      },
      borderRadius: {
        lg: "0.85rem",
        md: "0.65rem",
        sm: "0.45rem"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top, rgba(14,116,144,0.12), transparent 45%), linear-gradient(180deg, rgba(255,255,255,0.95), rgba(241,245,249,1))"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
