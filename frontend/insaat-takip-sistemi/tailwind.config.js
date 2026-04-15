/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#071226',
          900: '#0A1A38',
          800: '#0F2452',
          700: '#14306B',
        },
      },
      boxShadow: {
        soft: '0 10px 25px -15px rgba(0,0,0,.35)',
        neon: '0 0 40px -8px rgba(56, 189, 248, 0.45)',
        'neon-red': '0 0 32px -6px rgba(248, 113, 113, 0.55)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
