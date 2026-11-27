/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080b1d",
        panel: "#121733",
        neon: "#ff2b90",
        violet: "#6d016d",
        gold: "#ffbc24",
        cyan: "#3d6ff6",
      },
      fontFamily: {
        sans: ["Pricedown", "Passion One", "Outfit", "Josefin Sans", "system-ui", "sans-serif"],
        display: ["Pricedown", "Passion One", "Outfit", "Josefin Sans", "system-ui", "sans-serif"],
        urdu: ["Urdu Najd", "Noto Nastaliq Urdu", "serif"],
      },
      boxShadow: {
        glow: "0 20px 60px -30px rgba(255,43,144,0.7)",
      },
    },
  },
  plugins: [],
};
