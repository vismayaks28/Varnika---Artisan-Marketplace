/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FAF7F2',
          dark: '#F1ECE1',
          border: '#E2D9C8',
        },
        terracotta: {
          DEFAULT: '#B85032',
          hover: '#9E4126',
          light: '#F7EAE5',
        },
        forest: {
          DEFAULT: '#234234',
          hover: '#193126',
          light: '#E6EFEA',
        },
        gold: {
          DEFAULT: '#B38B3F',
          light: '#F6EFE0',
        },
        ink: {
          DEFAULT: '#1F2421',
          muted: '#5A625D',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};