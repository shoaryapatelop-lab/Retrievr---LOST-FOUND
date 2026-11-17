/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — "Beacon Blue": confident, trustworthy marketplace action colour.
        primary: {
          50: '#eef3ff',
          100: '#dce6ff',
          200: '#bcccff',
          300: '#93adff',
          400: '#6285ff',
          500: '#2e5bff',
          600: '#1f46e0',
          700: '#1838b8',
          800: '#163093',
          900: '#152b74',
        },
        // Accent — "Saffron": the Retrievr signature highlight (found / recovered energy).
        accent: {
          50: '#fff8ea',
          100: '#ffefc7',
          200: '#ffdd8a',
          300: '#ffc44d',
          400: '#ffb020',
          500: '#f59300',
          600: '#c77700',
          700: '#9a5b00',
          800: '#7c4a05',
          900: '#663d0a',
        },
        // Ink — deep navy used for headers, footer and strong text.
        ink: {
          DEFAULT: '#0a1633',
          900: '#0a1633',
          800: '#12224a',
          700: '#1c2f5c',
          600: '#2a3f6d',
        },
        // Surfaces
        canvas: '#f4f6fa',
        surface: '#ffffff',
        hairline: '#e3e8ef',
        // Semantic status colours (no violet anywhere in the product design).
        lost: '#e5484d',
        found: '#0e9f6e',
        claimed: '#f5a524',
        returned: '#0d9488',
        // Feedback
        success: '#0e9f6e',
        danger: '#e5484d',
        warning: '#f5a524',
        info: '#2e5bff',
      },
      fontFamily: {
        // Distinctive display face paired with a refined, readable body face.
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,22,51,0.04), 0 1px 3px rgba(10,22,51,0.06)',
        'card-hover': '0 18px 40px -18px rgba(10,22,51,0.28)',
        nav: '0 1px 0 rgba(10,22,51,0.06), 0 4px 16px -8px rgba(10,22,51,0.12)',
        btn: '0 1px 2px rgba(10,22,51,0.10)',
        'btn-lg': '0 8px 20px -10px rgba(31,70,224,0.55)',
        float: '0 24px 60px -24px rgba(10,22,51,0.35)',
        'inner-hairline': 'inset 0 0 0 1px rgba(10,22,51,0.06)',
      },
      backgroundImage: {
        'grid-faint':
          'radial-gradient(circle at 1px 1px, rgba(10,22,51,0.10) 1px, transparent 0)',
        'grid-faint-light':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'draw-check': {
          '0%': { strokeDashoffset: '48' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        // Signature easing used across the product.
        snap: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}