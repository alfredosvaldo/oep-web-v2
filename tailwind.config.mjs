/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        oep: {
          slate: '#0F172A',
          emerald: '#10B981',
          copper: '#F59E0B',
          copperDark: '#B45309',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          500: '#64748B',
          700: '#334155',
        },
      },
      fontFamily: {
        display: ['var(--font-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-robotomono)', 'monospace'],
      },
      maxWidth: {
        content: '1440px',
      },
      transitionDuration: {
        filter: '180ms',
        chart: '280ms',
        count: '240ms',
        nav: '320ms',
      },
    },
  },
  plugins: [],
};

export default config;
