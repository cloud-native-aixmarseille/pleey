/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Electric Dreams Color Palette
        primary: {
          50: '#e0f9ff',
          100: '#b3f0ff',
          200: '#80e7ff',
          300: '#4dddff',
          400: '#26d4ff',
          500: '#00cbff', // Main primary - electric cyan
          600: '#00b8f0',
          700: '#009fd6',
          800: '#0086bc',
          900: '#005d91',
        },
        secondary: {
          50: '#fff4ed',
          100: '#ffe4d1',
          200: '#ffc7a3',
          300: '#ffa36a',
          400: '#ff7a3f',
          500: '#ff5517', // Main secondary - coral orange
          600: '#f0420d',
          700: '#c7330d',
          800: '#9e2914',
          900: '#7f2514',
        },
        accent: {
          50: '#f7ffe5',
          100: '#ebffcc',
          200: '#d9ff99',
          300: '#c0ff66',
          400: '#a8ff33',
          500: '#8fff00', // Main accent - neon lime
          600: '#7ae600',
          700: '#63cc00',
          800: '#4db300',
          900: '#3a9900',
        },
        success: {
          50: '#e6fff5',
          100: '#b3ffe0',
          200: '#80ffc9',
          300: '#4dffb3',
          400: '#1aff9d',
          500: '#00e685', // Emerald success
          600: '#00cc75',
          700: '#00b365',
          800: '#009955',
          900: '#007a44',
        },
        danger: {
          50: '#ffe6f2',
          100: '#ffb3d9',
          200: '#ff80bf',
          300: '#ff4da6',
          400: '#ff1a8c',
          500: '#e6007a', // Hot magenta
          600: '#cc006b',
          700: '#b3005c',
          800: '#99004d',
          900: '#80003e',
        },
        dark: {
          50: '#e8ebf0',
          100: '#c1c9d6',
          200: '#99a5ba',
          300: '#70819e',
          400: '#4f6689',
          500: '#2e4a74', // Deep navy
          600: '#29426c',
          700: '#233961',
          800: '#1d3057',
          900: '#121f44',
        },
        light: {
          50: '#ffffff',
          100: '#fafbfc',
          200: '#f4f6f8',
          300: '#e8ecf1',
          400: '#d1dae6',
          500: '#bac8db', // Warm gray
          600: '#a8b5c7',
          700: '#95a3b3',
          800: '#83919f',
          900: '#707e8b',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'xxs': '0.625rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 203, 255, 0.3)',
        'glow': '0 0 20px rgba(0, 203, 255, 0.4)',
        'glow-lg': '0 0 40px rgba(0, 203, 255, 0.5)',
        'neon': '0 0 5px theme(colors.primary.400), 0 0 20px theme(colors.primary.500)',
        'neon-secondary': '0 0 5px theme(colors.secondary.400), 0 0 20px theme(colors.secondary.500)',
        'neon-accent': '0 0 5px theme(colors.accent.400), 0 0 20px theme(colors.accent.500)',
        'float': '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.05)',
        'float-lg': '0 20px 60px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
