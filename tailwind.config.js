/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mono: {
          darkest: '#1A1A1A',
          darker: '#333333',
          dark: '#555555',
          medium: '#777777',
          light: '#AAAAAA',
          lighter: '#DDDDDD',
          lightest: '#F5F5F5',
          accent: '#0066CC',
          'accent-light': '#E6F0FA',
        },
        kontext: {
          blue: {
            DEFAULT: '#0066CC',
            light: '#E6F0FA',
            dark: '#0052A3',
          },
          purple: {
            DEFAULT: '#333333',
            light: '#666666',
            dark: '#1A1A1A',
          },
          gray: {
            DEFAULT: '#f5f5f5',
            light: '#fafafa',
            dark: '#e0e0e0',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}