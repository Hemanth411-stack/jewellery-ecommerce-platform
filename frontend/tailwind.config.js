/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171412",
        champagne: "#f6efe4",
        pearl: "#fbfaf7",
        bronze: "#9c6f3c",
        rosewood: "#6f3f37",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 20, 18, 0.08)",
      },
    },
  },
  plugins: [],
};
