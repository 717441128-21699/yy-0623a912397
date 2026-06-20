/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          900: '#0A1929',
          800: '#0F2B46',
          700: '#1B3A5C',
          600: '#264F7B',
        },
        ice: {
          500: '#00B4D8',
          400: '#48CAE4',
          300: '#90E0EF',
        },
        warn: {
          500: '#FF6B35',
          400: '#FF8F5E',
          600: '#E55A25',
        },
        ok: {
          500: '#00C853',
          400: '#69F0AE',
        },
        cool: {
          50: '#F0F7FF',
          100: '#E1EFFF',
        },
      },
      fontFamily: {
        din: ['"DIN Alternate"', '"Roboto Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 1.5s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.4s ease-out',
        'check-pop': 'check-pop 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
