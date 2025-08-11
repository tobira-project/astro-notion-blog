/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'tobiracast': {
          'blue': '#1779DE',
          'light-blue': '#4d94ff',
          'dark-blue': '#004c99',
          'orange': '#E96800',
          'light-orange': '#ff9a4d',
          'dark-orange': '#cc5500',
        },
        'primary': '#1779DE',
        'secondary': '#E96800',
        'gray': {
          50: '#f9fafb',
          100: '#f4f4f4',
          200: '#e4e4e4',
          300: '#ddd',
          400: '#999',
          500: '#777',
          600: '#666',
          700: '#333',
          800: '#222',
          900: '#1a1a1a',
        },
        'surface': {
          primary: '#ffffff',
          secondary: '#f5f8fa',
          premium: '#fff9f0',
          subtle: '#f9fafb',
          muted: '#f4f4f4',
        },
        'border': {
          DEFAULT: '#e1e8ed',
          premium: '#ffe4cc',
          light: '#e4e4e4',
          subtle: '#f4f4f4',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica',
          'Hiragino Sans',
          'Hiragino Kaku Gothic ProN',
          'Hiragino Sans GB',
          'メイリオ',
          'Meiryo',
          'Apple Color Emoji',
          'Arial',
          'sans-serif',
          'Segoe UI Emoji',
          'Segoe UI Symbol'
        ]
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-up-delay-1': 'fadeInUp 0.8s ease-out 0.1s forwards',
        'fade-in-up-delay-2': 'fadeInUp 0.8s ease-out 0.2s forwards',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        shimmer: {
          '0%': {
            transform: 'translateX(-100%)'
          },
          '100%': {
            transform: 'translateX(100%)'
          }
        }
      },
      boxShadow: {
        'tobiracast': '0 10px 30px rgba(23, 121, 222, 0.2)',
        'tobiracast-hover': '0 15px 40px rgba(23, 121, 222, 0.3)',
        'tobiracast-card': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'tobiracast-card-hover': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'tobiracast-button': '0 2px 8px rgba(233, 104, 0, 0.2)',
        'tobiracast-button-hover': '0 4px 12px rgba(233, 104, 0, 0.3)',
        'tobiracast-nav': '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'tobiracast-nav-hover': '0 8px 30px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'tobiracast-content': '0 -10px 30px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}