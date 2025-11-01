/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {
      fontFamily: {
        serif: ['DM Serif Display', 'serif'],
      },
    },
  },
  plugins: [],
}

