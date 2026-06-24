/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          crimson: '#C1121F',
          gold: '#D97706',
          blue: '#2563EB',
          bg: '#FAFAF9',
          surface: '#F5F3F0',
          dark: '#0F172A',
          ink: '#111827'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        italic: ['"Cormorant Garamond"', 'serif']
      },
      fontSize: {
        dynamic: ['clamp(3rem, 8vw, 8rem)', { lineHeight: '0.9' }]
      }
    },
  },
  plugins: [],
}
