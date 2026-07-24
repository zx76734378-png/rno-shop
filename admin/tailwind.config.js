/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        sage: '#4A6741', 'sage-dark': '#3A5333', 'sage-light': '#E8EFE5',
        cream: '#FAFAF8', charcoal: '#2D2D2D',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
