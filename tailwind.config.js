/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        pitch: {
          950: '#080A0F',
          900: '#0D1117',
          800: '#141920',
          700: '#1C2330',
          600: '#242D3A',
          500: '#2E3A4A',
        },
        turf: '#22C55E',
        penalty: '#EF4444',
        gold: '#F59E0B',
        ice: '#38BDF8',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'field-lines': 'repeating-linear-gradient(90deg, transparent, transparent 9.9%, rgba(255,255,255,0.02) 10%)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'ticker': 'ticker 30s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'counter-up': 'counterUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'card-fly-in': 'cardFlyIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        slideUp: { from: { transform: 'translateY(100%)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        slideDown: { from: { transform: 'translateY(-100%)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { transform: 'scale(0.9)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        ticker: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(-100%)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 20px var(--team-color, #22C55E)' }, '50%': { boxShadow: '0 0 40px var(--team-color, #22C55E), 0 0 80px var(--team-color, #22C55E)33' } },
        counterUp: { from: { transform: 'translateY(100%)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        cardFlyIn: { from: { transform: 'translateY(40px) scale(0.95)', opacity: 0 }, to: { transform: 'translateY(0) scale(1)', opacity: 1 } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
