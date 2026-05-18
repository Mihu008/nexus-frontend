/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom branding colors matching the premium dark mode
        brand: {
          darkest: '#020617', // slate-950
          panel: '#18181b',   // zinc-900
          border: '#27272a',  // zinc-800
          muted: '#71717a',   // zinc-500
          accent: '#6366f1',  // indigo-500
          success: '#10b981', // emerald-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
