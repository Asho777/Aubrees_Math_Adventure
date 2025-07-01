/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bluey: {
          blue: '#4A90E2',
          orange: '#FF8C42',
          yellow: '#FFD93D',
          green: '#6BCF7F',
          purple: '#9B59B6',
          pink: '#FF69B4'
        }
      },
      fontFamily: {
        'comic': ['Comic Sans MS', 'cursive'],
        'fun': ['Fredoka One', 'cursive']
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-fast': 'pulse 1s infinite',
        'jump': 'jump 0.6s ease-in-out',
        'celebrate': 'celebrate 0.8s ease-in-out'
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        jump: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        celebrate: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(-5deg)' },
          '50%': { transform: 'scale(1.2) rotate(5deg)' },
          '75%': { transform: 'scale(1.1) rotate(-3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
}
