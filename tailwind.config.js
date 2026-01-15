/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          50: '#E8EBF0',
          100: '#C5CBD6',
          200: '#9BA5B8',
          300: '#717D99',
          400: '#4D5C7A',
          500: '#2E3D5C',
          600: '#1C2A45',
          700: '#141F35',
          800: '#0F1829',
          900: '#0A1628',
        },
        gold: {
          DEFAULT: '#F5A623',
          50: '#FEF7E8',
          100: '#FCEBC5',
          200: '#FADB9E',
          300: '#F8CB77',
          400: '#F6BB50',
          500: '#F5A623',
          600: '#D4890C',
          700: '#A36A09',
          800: '#724A06',
          900: '#412B04',
        },
        sage: {
          DEFAULT: '#4A7C59',
          50: '#EDF3EF',
          100: '#D4E4D9',
          200: '#B8D2C0',
          300: '#9BC0A7',
          400: '#7FAE8E',
          500: '#4A7C59',
          600: '#3D6749',
          700: '#305239',
          800: '#233D2A',
          900: '#16281B',
        },
        cream: '#FAFAF8',
        charcoal: '#2D3436',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(10, 22, 40, 0.08), 0 4px 16px -4px rgba(10, 22, 40, 0.12)',
        'medium': '0 4px 12px -2px rgba(10, 22, 40, 0.1), 0 8px 24px -4px rgba(10, 22, 40, 0.15)',
        'strong': '0 8px 24px -4px rgba(10, 22, 40, 0.15), 0 16px 48px -8px rgba(10, 22, 40, 0.2)',
        'glow-gold': '0 0 20px rgba(245, 166, 35, 0.3)',
        'glow-sage': '0 0 20px rgba(74, 124, 89, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'confetti': 'confetti 0.8s ease-out forwards',
        'number-tick': 'numberTick 0.1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        numberTick: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
