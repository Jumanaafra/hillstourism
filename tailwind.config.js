/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#040d04',
          900: '#080f08',
          800: '#0c1a0c',
          700: '#142614',
          600: '#1e3d1e',
          500: '#2d5c2d',
        },
        gold: {
          300: '#f0da8e',
          400: '#e8c96e',
          500: '#c9a84c',
          600: '#a8882e',
          700: '#886b18',
        },
        cream: {
          50:  '#faf8f3',
          100: '#f5f0e8',
          200: '#ede5d4',
          300: '#ddd0b8',
        },
        charcoal: {
          900: '#0d0d0d',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#3d3d3d',
          500: '#5a5a5a',
          400: '#7a7a7a',
          300: '#a0a0a0',
          200: '#c8c8c8',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['"Crimson Text"', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        premium:   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
