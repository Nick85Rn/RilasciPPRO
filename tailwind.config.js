/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pienissimo: {
          blue: '#1A65A4', 
          dark: '#134D7D'
        }
      }
    },
  },
  plugins: [],
}