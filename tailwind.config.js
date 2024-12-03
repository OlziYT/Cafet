/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'marron': {
          50: '#FAF6F3',
          100: '#F2EAE3',
          200: '#E5D5C5',
          300: '#D8BFA8',
          400: '#C9A68A',
          500: '#BA8D6D',
          600: '#A67750',
          700: '#8B613F',
          800: '#6F4C2F',
          900: '#53381F',
        },
        'bordeaux': {
          50: '#FCF5F5',
          100: '#F9EBEB',
          200: '#F0CECE',
          300: '#E7B1B1',
          400: '#D87676',
          500: '#C93B3B',
          600: '#B53535',
          700: '#972C2C',
          800: '#792323',
          900: '#5C1A1A',
        },
        'olive': {
          50: '#FBFBF7',
          100: '#F7F7EF',
          200: '#EBECD7',
          300: '#DFE1BF',
          400: '#C7CA8F',
          500: '#AFB35F',
          600: '#9EA156',
          700: '#838647',
          800: '#696B39',
          900: '#4F502B',
        }
      },
      fontFamily: {
        'title': ['Cormorant Garamond', 'serif'],
        'body': ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'menu-pattern': "url('https://www.transparenttextures.com/patterns/food.png')",
        'paper-texture': "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'sizzle': 'sizzle 1s ease-in-out',
        'steam': 'steam 2s ease-in-out infinite',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}