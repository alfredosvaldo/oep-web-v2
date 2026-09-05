/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        oep: {
          // Tinta (texto sobre papel y bandas oscuras) y papel cálido (fondo base)
          ink: '#14171C',
          paper: '#FAF8F5',
          line: 'rgba(20,23,28,0.14)',
          lineLight: 'rgba(255,255,255,0.16)',
          slate: '#10141A',
          emerald: '#0E9F6E',
          emeraldLight: '#34D399',
          copper: '#C2703D',
          copperDark: '#9A5830',
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
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plexmono)', 'monospace'],
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
