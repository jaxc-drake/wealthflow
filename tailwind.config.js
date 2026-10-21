/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFE347",
          green: "#B8FF4F",
          pink: "#FF6B9D",
          blue: "#4ECBFF",
          orange: "#FF8C42",
          purple: "#C084FC",
          red: "#FF4444",
        },
        neo: {
          bg: "#FFFEF0",
          card: "#FFFFFF",
          border: "#1A1A1A",
          text: "#1A1A1A",
          muted: "#6B7280",
          shadow: "#1A1A1A",
        },
      },
      borderWidth: { "3": "3px" },
      boxShadow: {
        neo: "4px 4px 0px #1A1A1A",
        "neo-lg": "6px 6px 0px #1A1A1A",
        "neo-sm": "2px 2px 0px #1A1A1A",
      },
    },
  },
  plugins: [],
};