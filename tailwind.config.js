/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["Playfair Display", "serif"],
        agentsSerif: ['"Playfair Display"', "Georgia", "serif"],
        helvetica: ["Helvetica Now Text", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out",
      },
      colors: {
        wander: {
          accent: "#E9B876",
          dark: "#203F3C",
          grayLight: "#F7F7F7",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        /* PV Agents — paleta aislada; no pisa tokens globales */
        agents: {
          "navy-darker": "hsl(var(--agents-navy-darker) / <alpha-value>)",
          "navy-deep": "hsl(var(--agents-navy-deep) / <alpha-value>)",
          background: "hsl(var(--agents-background) / <alpha-value>)",
          card: "hsl(var(--agents-card) / <alpha-value>)",
          foreground: "hsl(var(--agents-foreground) / <alpha-value>)",
          primary: {
            DEFAULT: "hsl(var(--agents-primary) / <alpha-value>)",
            foreground: "hsl(var(--agents-primary-foreground) / <alpha-value>)",
          },
          secondary: "hsl(var(--agents-secondary) / <alpha-value>)",
          muted: {
            DEFAULT: "hsl(var(--agents-muted) / <alpha-value>)",
            foreground: "hsl(var(--agents-muted-foreground) / <alpha-value>)",
          },
          border: "hsl(var(--agents-border) / <alpha-value>)",
          "gold-light": "hsl(var(--agents-gold-light) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
