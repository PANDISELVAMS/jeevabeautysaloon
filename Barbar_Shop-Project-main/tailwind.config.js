/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
          dark: '#A0802E',
        },
        black: {
          DEFAULT: '#0A0A0A',
          soft: '#111111',
          card: '#1A1A1A',
          border: '#2A2A2A',
        },
        cream: '#F5F0E8',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        bebas: ['"Bebas Neue"', 'sans-serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        fadeUp: 'fadeUp 0.6s ease both',
        pulse_slow: 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
