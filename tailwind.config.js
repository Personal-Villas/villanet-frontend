/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        helvetica: ['Helvetica Now Text', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'], // Mantener Manrope disponible
      },
      // Animaciones agregadas
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out'
      },
      // Colores personalizados
      colors: {
        wander: {
          accent: '#E9B876', // dorado/naranja suave
          dark: '#203F3C',    // verde azulado profundo
          grayLight: '#F7F7F7',
        },
        // Colores para el tema (necesarios para las clases como text-muted-foreground)
        border: "hsl(var(--border) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
      }
    },
  },
  plugins: [],
}