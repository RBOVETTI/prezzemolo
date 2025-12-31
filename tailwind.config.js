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
        dark: '#d0d0d8',
        'dark-light': '#e5e5ea',
        'dark-lighter': '#f0f0f5',
        'text-muted': '#4a4a54',
      },
    },
  },
  plugins: [],
}
