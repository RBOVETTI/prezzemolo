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
        'bg': '#FAFAF8',
        'bg-card': '#FFFFFF',
        'bg-input': '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'accent-warm': '#8B2635',
        'accent-cold': '#1B365D',
        'border': 'rgba(27, 54, 93, 0.1)',
        'border-strong': 'rgba(27, 54, 93, 0.2)',
        // Alias per uso nei componenti
        primary: '#8B2635',
        'primary-dark': '#6B1D29',
      },
      fontFamily: {
        'serif': ['Cormorant Garamond', 'Georgia', 'serif'],
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
