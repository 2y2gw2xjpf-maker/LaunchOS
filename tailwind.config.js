/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════════════
        // PRIMARY - PURPLE (Lovable Signature)
        // ═══════════════════════════════════════════════════════════
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },

        // ═══════════════════════════════════════════════════════════
        // ACCENT - PINK/MAGENTA (Energie & Dynamik)
        // ═══════════════════════════════════════════════════════════
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },

        // ═══════════════════════════════════════════════════════════
        // SECONDARY - VIOLET/INDIGO (Tiefe)
        // ═══════════════════════════════════════════════════════════
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },

        // ═══════════════════════════════════════════════════════════
        // BACKGROUNDS (Soft & Modern)
        // ═══════════════════════════════════════════════════════════
        background: {
          DEFAULT: '#fafafa',
          soft: '#f8f7ff',
          card: '#ffffff',
          dark: '#0f0f23',
        },

        // ═══════════════════════════════════════════════════════════
        // TEXT
        // ═══════════════════════════════════════════════════════════
        text: {
          primary: '#1a1a2e',
          secondary: '#4a4a6a',
          muted: '#8888a8',
          inverse: '#ffffff',
        },

        // ═══════════════════════════════════════════════════════════
        // SPECIAL COLORS
        // ═══════════════════════════════════════════════════════════
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',

        // Legacy colors for backwards compatibility
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          DEFAULT: '#9333ea',
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          light: '#F472B6',
          DEFAULT: '#ec4899',
          dark: '#DB2777',
        },
        cream: {
          DEFAULT: '#f8f7ff',
          50: '#f8f7ff',
          100: '#faf5ff',
          200: '#f3e8ff',
        },
        charcoal: '#1a1a2e',
        navy: {
          DEFAULT: '#1a1a2e',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        gold: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        sage: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        info: '#8b5cf6',
      },

      // ═══════════════════════════════════════════════════════════
      // GRADIENTS (Lovable Signature!)
      // ═══════════════════════════════════════════════════════════
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
        'gradient-hero': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #06b6d4 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #f8f7ff 0%, #fdf2f8 100%)',
        'gradient-button': 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        'gradient-border': 'linear-gradient(135deg, #9333ea, #ec4899, #06b6d4)',
        'gradient-glow': 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
      },

      // ═══════════════════════════════════════════════════════════
      // SHADOWS (Colored für Lovable Feel)
      // ═══════════════════════════════════════════════════════════
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'strong': '0 12px 40px rgba(0, 0, 0, 0.16)',
        'glow-purple': '0 0 40px rgba(147, 51, 234, 0.3)',
        'glow-pink': '0 0 40px rgba(236, 72, 153, 0.3)',
        'glow-mixed': '0 0 60px rgba(147, 51, 234, 0.2), 0 0 40px rgba(236, 72, 153, 0.2)',
        'card': '0 2px 10px rgba(147, 51, 234, 0.08)',
        'card-hover': '0 8px 30px rgba(147, 51, 234, 0.15)',
        'glow-brand': '0 0 20px rgba(147, 51, 234, 0.3)',
        'glow-accent': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-sage': '0 0 20px rgba(16, 185, 129, 0.3)',
      },

      // ═══════════════════════════════════════════════════════════
      // FONTS
      // ═══════════════════════════════════════════════════════════
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
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

      // ═══════════════════════════════════════════════════════════
      // ANIMATIONS
      // ═══════════════════════════════════════════════════════════
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
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
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' },
          'to': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
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
