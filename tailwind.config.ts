import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: "#FDF8EE",      // Background
          dark: "#2D2D2D",       // Neutral Dark Grey (Not Navy)
          
          // Logo-inspired Palette
          yellow: "#f9e7bbff",     // Warm Yellow (Action)
          pink: "#FF8FAB",       // Vibrant Pink (Action/Highlight)
          blue: "#5aa1c4ff",       // Sky Blue (Accents)
          purple: "#D0BFFF",     // Soft Purple
          teal: "#63E6BE",       // Soft Mint
          gray: "#9A9EA6",
        }
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'], 
        heading: ['var(--font-montserrat)', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(255, 143, 171, 0.2)', // Pink-ish shadow
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      }
    },
  },
  plugins: [],
};
export default config;