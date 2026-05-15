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
      keyframes: {
        'duyuru-alert': {
          '0%, 100%': {
            boxShadow:
              '0 0 18px -2px rgba(251, 191, 36, 0.45), 0 8px 36px -10px rgba(251, 191, 36, 0.25), inset 0 0 0 1px rgba(253, 224, 71, 0.12)',
            borderColor: 'rgba(251, 191, 36, 0.45)',
          },
          '50%': {
            boxShadow:
              '0 0 36px 2px rgba(250, 204, 21, 0.65), 0 10px 44px -8px rgba(251, 191, 36, 0.5), inset 0 0 0 1px rgba(254, 243, 199, 0.35)',
            borderColor: 'rgba(253, 224, 71, 0.95)',
          },
        },
      },
      animation: {
        'duyuru-alert': 'duyuru-alert 1.35s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
