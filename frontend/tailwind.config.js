/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: [
        "Inter var",
        "Inter",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "sans-serif",
      ],
      display: ['"Press Start 2P"', "system-ui", "sans-serif"],
      mono: ['"VT323"', '"Fira Code"', "monospace"],
      body: ['"Orbitron"', "system-ui", "sans-serif"],
    },
    extend: {
      colors: {
        // Cyber Arcade - Retro Synthwave Gaming Palette
        primary: {
          50: "#f0f0ff",
          100: "#e0dcff",
          200: "#c7c0ff",
          300: "#a89dff",
          400: "#8a73ff",
          500: "#6b48ff", // Main primary - electric purple
          600: "#5c3ad6",
          700: "#4d2db3",
          800: "#3e2090",
          900: "#2f1870",
        },
        secondary: {
          50: "#fff0fb",
          100: "#ffd6f3",
          200: "#ffade8",
          300: "#ff85dd",
          400: "#ff5cd1",
          500: "#ff33c6", // Main secondary - hot pink
          600: "#d62ba3",
          700: "#b32387",
          800: "#901b6b",
          900: "#6d144f",
        },
        accent: {
          50: "#e6fff9",
          100: "#b3fff0",
          200: "#80ffe6",
          300: "#4dffdd",
          400: "#1affd4",
          500: "#00ffcc", // Main accent - cyber cyan
          600: "#00d6ad",
          700: "#00b38f",
          800: "#009070",
          900: "#006d52",
        },
        success: {
          50: "#e6ffed",
          100: "#b3ffc8",
          200: "#80ffa3",
          300: "#4dff7e",
          400: "#1aff59",
          500: "#00ff41", // Matrix green
          600: "#00d636",
          700: "#00b32c",
          800: "#009022",
          900: "#006d18",
        },
        danger: {
          50: "#ffe6e6",
          100: "#ffb3b3",
          200: "#ff8080",
          300: "#ff4d4d",
          400: "#ff1a1a",
          500: "#ff0000", // Pure red - arcade style
          600: "#d60000",
          700: "#b30000",
          800: "#900000",
          900: "#6d0000",
        },
        dark: {
          50: "#e6e6f0",
          100: "#b3b3d6",
          200: "#8080bc",
          300: "#4d4da3",
          400: "#2d2d70",
          500: "#0a0a1f", // Almost black - deep space
          600: "#080819",
          700: "#060614",
          800: "#04040f",
          900: "#02020a",
        },
        light: {
          50: "#ffffff",
          100: "#f5f5ff",
          200: "#ebebff",
          300: "#d6d6ff",
          400: "#c2c2ff",
          500: "#adadff", // Soft lavender
          600: "#9999e6",
          700: "#8585cc",
          800: "#7070b3",
          900: "#5c5c99",
        },
        // Retro arcade colors
        arcade: {
          yellow: "#ffff00",
          orange: "#ff9900",
          blue: "#0099ff",
          green: "#00ff00",
          pink: "#ff00ff",
        },
      },
      fontSize: {
        xxs: "0.625rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
        "7xl": "4.5rem",
        "8xl": "6rem",
        "9xl": "8rem",
      },
      borderRadius: {
        none: "0",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(107, 72, 255, 0.5)",
        glow: "0 0 20px rgba(107, 72, 255, 0.6)",
        "glow-lg": "0 0 40px rgba(107, 72, 255, 0.7)",
        neon: "0 0 5px #8a73ff, 0 0 20px #6b48ff, 0 0 40px #5c3ad6",
        "neon-secondary": "0 0 5px #ff5cd1, 0 0 20px #ff33c6, 0 0 40px #d62ba3",
        "neon-accent": "0 0 5px #1affd4, 0 0 20px #00ffcc, 0 0 40px #00d6ad",
        pixel: "4px 4px 0px rgba(0, 0, 0, 0.8)",
        "pixel-lg": "8px 8px 0px rgba(0, 0, 0, 0.8)",
        crt: "inset 0 0 100px rgba(107, 72, 255, 0.1)",
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-in",
        "scale-in": "scaleIn 0.3s ease-out",
        glitch: "glitch 0.5s infinite",
        scanline: "scanline 8s linear infinite",
        flicker: "flicker 0.15s infinite",
        "pixel-pop": "pixelPop 0.3s ease-out",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        glow: {
          "0%, 100%": { opacity: "1", textShadow: "0 0 20px currentColor" },
          "50%": { opacity: "0.8", textShadow: "0 0 40px currentColor" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "33%": { transform: "translate(-2px, 2px)" },
          "66%": { transform: "translate(2px, -2px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        pixelPop: {
          "0%": { transform: "scale(0.8) rotate(-5deg)" },
          "50%": { transform: "scale(1.1) rotate(5deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient": "linear-gradient(135deg, var(--tw-gradient-stops))",
        scanlines:
          "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)",
        grid: "linear-gradient(rgba(107, 72, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(107, 72, 255, 0.1) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "20px 20px",
      },
    },
  },
  plugins: [],
};
