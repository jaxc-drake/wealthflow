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
          lime: "#D6FF3F",
          yellow: "#D6FF3F",
          green: "#D6FF3F",
          pink: "#FF5FA2",
          blue: "#6FD3FF",
          orange: "#FF9E2C",
          purple: "#8B5CF6",
          red: "#FF4D4D",
        },
        neo: {
          bg: "#E9E4FF",
          card: "#FFFFFF",
          border: "#0A0A0A",
          text: "#0A0A0A",
          muted: "#6B6478",
          shadow: "#0A0A0A",
        },
        y2k: {
          lavender: "#E9E4FF",
          lilac: "#D9D1FF",
          lime: "#D6FF3F",
          purple: "#8B5CF6",
          pink: "#FF5FA2",
          blue: "#6FD3FF",
          ink: "#0A0A0A",
          paper: "#FFFFFF",
          muted: "#6B6478",
          chrome: "#C7C9D1",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "system-ui", "sans-serif"],
        wordmark: ["var(--font-archivo)", "Arial Black", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontWeight: {
        600: "600",
        700: "700",
        800: "800",
        900: "900",
      },
      borderWidth: { "3": "3px", "4": "4px" },
      borderRadius: { "4xl": "2rem" },
      boxShadow: {
        neo: "4px 4px 0px #0A0A0A",
        "neo-lg": "7px 7px 0px #0A0A0A",
        "neo-sm": "2px 2px 0px #0A0A0A",
        hard: "4px 4px 0px #0A0A0A",
        "hard-lg": "7px 7px 0px #0A0A0A",
        "hard-sm": "2px 2px 0px #0A0A0A",
        lime: "4px 4px 0px #D6FF3F",
        "lime-lg": "6px 6px 0px #D6FF3F",
      },
    },
  },
  plugins: [],
};
