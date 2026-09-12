/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#05070a",
          900: "#0b0f14",
          850: "#0f141b",
          800: "#141a23",
          700: "#1c2430",
          600: "#2a3441",
        },
        accent: {
          DEFAULT: "#22d3ee",
          soft: "#67e8f9",
          dim: "#0e7490",
        },
        good: "#34d399",
        warn: "#fbbf24",
        bad: "#f87171",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
