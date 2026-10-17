/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Schema grafico allineato a rbovetti.com
        'bg': '#f7f4ed',
        'bg-card': '#ffffff',
        'bg-input': '#FFFFFF',
        'text-primary': '#121417',
        'text-secondary': '#575c66',
        'accent-warm': '#c23e12',
        'accent-cold': '#121417',
        'border': '#cfccc4',
        'border-strong': '#121417',
        // Alias per uso nei componenti
        primary: '#e8501f',
        'primary-dark': '#c23e12',
      },
      fontFamily: {
        'serif': ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'sans': ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
