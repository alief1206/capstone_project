/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        dash: {
          'to': { strokeDashoffset: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeSlideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        dash: 'dash 2s ease-out forwards',
        scaleIn: 'scaleIn 0.2s ease-out forwards',
        fadeSlideUp: 'fadeSlideUp 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}