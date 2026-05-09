/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Electrolyte Solutions Branding (Blue/Cyan energy theme)
        brand: {
          primary: '#0ea5e9', 
          dark: '#0369a1',
        }
      }
    },
  },
  plugins: [],
}