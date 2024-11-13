// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this based on your file structure
  ],
  theme: {
    extend: {
      colors: {
        primary: "#507DCD",
        secondary: "#3360b1",
        "hover-link": "#93c5fd",
      },
    },
  },
  plugins: [],
};
