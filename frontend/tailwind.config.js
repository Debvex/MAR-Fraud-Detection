/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-container": "var(--color-surface-container)",
        "surface-high": "var(--color-surface-high)",
        primary: "var(--color-primary)",
        "primary-container": "var(--color-primary-container)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        error: "var(--color-error)",
        outline: "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
      },
      screens: {
        xs: "320px",    // Mobile
        sm: "640px",    // Tablet small
        md: "768px",    // Tablet
        lg: "1024px",   // Laptop small
        xl: "1280px",   // Laptop
        "2xl": "1536px", // Large desktop
      },
      spacing: {
        "safe-top": "max(1rem, env(safe-area-inset-top))",
        "safe-bottom": "max(1rem, env(safe-area-inset-bottom))",
        "safe-left": "max(1rem, env(safe-area-inset-left))",
        "safe-right": "max(1rem, env(safe-area-inset-right))",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      animation: {
        ping: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      backgroundImage: {
        "linear-to-br": "linear-gradient(to bottom right, var(--tw-gradient-stops))",
        "linear-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
  future: {
    respectDefaultRingColorOpacity: true,
  },
}
