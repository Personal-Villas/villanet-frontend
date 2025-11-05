/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Manrope', 'sans-serif'],
          serif: ['Playfair Display', 'serif'],
          helvetica: ['Helvetica Now Text', 'sans-serif'],
        },
      },
    },
    wander: {
      accent: '#E9B876', // dorado/naranja suave
      dark: '#203F3C',    // verde azulado profundo
      grayLight: '#F7F7F7',
    },
    plugins: [],
  }