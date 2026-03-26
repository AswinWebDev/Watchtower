/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05050A",
        card: "rgba(255, 255, 255, 0.03)",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        primary: "#3b82f6", 
        accent: "#8b5cf6", 
        textMain: "#F8FAFC",
        textMuted: "#94A3B8"
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      }
    },
  },
  plugins: [],
}
