/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Finding Good Brand Colors
        'fg-primary': '#1B5666',    // Deep teal - headers, buttons
        'fg-secondary': '#678C95',  // Medium teal - secondary text
        'fg-accent': '#CBC13D',     // Yellow-green - highlights
        'fg-light': '#EDF2F2',      // Off-white - backgrounds
        'fg-dark': '#174552',       // Darker teal - emphasis

        // FIRES Element Colors
        'fires-feelings': '#E57373',    // Red
        'fires-influence': '#64B5F6',   // Blue
        'fires-resilience': '#81C784',  // Green
        'fires-ethics': '#FFD54F',      // Yellow
        'fires-strengths': '#BA68C8',   // Purple

        // Signal Colors
        'signal-emerging': '#FFA726',   // Orange
        'signal-developing': '#42A5F5', // Blue
        'signal-grounded': '#66BB6A',   // Green

        // Score Colors (for 1-5 displays)
        'score-1': '#EF5350',  // Low - red
        'score-2': '#FFA726',  // Below avg - orange
        'score-3': '#FFEE58',  // Average - yellow
        'score-4': '#9CCC65',  // Above avg - light green
        'score-5': '#66BB6A',  // High - green
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', 'serif'],
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
