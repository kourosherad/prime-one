/** @type {import('tailwindcss').Config} */
//
// Tailwind CSS configuration for Prime One.
// Palette: primary #FFB300, black #000000, gray #808080, white #FFFFFF.
// Premium, minimal, luxurious, tech-focused (Apple/Stripe/Linear/Vercel/Notion).
//
module.exports = {
  darkMode: 'class',
  content: ['./public/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        // Brand tokens
        primary: {
          DEFAULT: '#FFB300',
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFB300',
          600: '#FF8F00',
          700: '#FF6F00',
          800: '#FF3D00',
          900: '#BF360C',
        },
        ink: '#000000',
        mist: '#808080',
        snow: '#FFFFFF',
        // Surface tokens for dark/light surfaces
        surface: {
          light: '#FFFFFF',
          'light-2': '#F7F7F8',
          dark: '#0A0A0B',
          'dark-2': '#131316',
          'dark-3': '#1C1C21',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'IRANSansX', 'Tahoma', 'system-ui', 'sans-serif'],
        display: ['IRANSansX', 'Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.08)',
        glow: '0 0 24px rgba(255, 179, 0, 0.35)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #FFB300 0%, #FF6F00 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0A0B 0%, #1C1C21 100%)',
        'glass-light':
          'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
        'glass-dark':
          'linear-gradient(135deg, rgba(28,28,33,0.7) 0%, rgba(10,10,11,0.5) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
