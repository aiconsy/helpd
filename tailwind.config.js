/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    { pattern: /(from|to)-(rose|red|orange|amber|yellow|sky|blue|violet|purple|emerald)-(400|500|600|700)/ }
  ],
  theme: {
    extend: {
      colors: {
        'status-green': '#10B981',
        'status-yellow': '#F59E0B',
        'status-red': '#EF4444',
        primary: '#3B82F6',
        secondary: '#6B7280',
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#1E3A8A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(30, 58, 138, 0.18)',
        pop: '0 20px 60px -20px rgba(30, 58, 138, 0.35)'
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.25)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite'
      },
      backgroundImage: {
        'grid-slate': "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0)"
      }
    },
  },
  plugins: [],
}
