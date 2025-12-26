/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d4af37',
        'primary-dark': '#b8941f',
        dark: '#2e2e38',
        'dark-light': '#3a3a44',
        'dark-lighter': '#4a4a54',
        'text-muted': '#b8b8c0',
      },
    },
  },
  plugins: [],
}
