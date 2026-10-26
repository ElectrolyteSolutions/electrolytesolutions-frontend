/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          fontFamily: {
          sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        },
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