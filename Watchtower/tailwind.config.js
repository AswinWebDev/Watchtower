/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        sidebar: "#1c1c1e",
        card: "#121212",
        cardBorder: "#262626",
        cardHover: "#1a1a1a",
        primary: "#dd3300", 
        primaryLight: "#ff4411",
        textMain: "#FFFFFF",
        textMuted: "#888888"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
