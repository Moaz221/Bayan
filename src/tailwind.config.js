/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'bayan-black': '#07090D',
        'bayan-gold': '#D4AF37',
        'bayan-blue': '#1E3A8A',
        'bayan-blue-light': '#3B82F6',
      },
      fontFamily: {
        'amiri': ['Amiri', 'serif'],
        'readex': ['Readex Pro', 'sans-serif'],
      }
    },
  },
  plugins: [],
}