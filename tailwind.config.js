/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Azul escuro slate-900
          light: '#334155',   // slate-700
        },
        accent: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669',   // emerald-600
        },
        danger: {
          DEFAULT: '#f43f5e', // rose-500
        },
        background: {
          DEFAULT: '#f8fafc', // slate-50
          paper: '#ffffff',
        },
        text: {
          primary: '#1e293b', // slate-800
          secondary: '#64748b', // slate-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
