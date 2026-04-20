/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F4EE',
        surface: '#FFFFFF',
        border: '#DDD8CE',
        text: '#1E1C18',
        'text-muted': '#6B6658',
        primary: {
          light: '#3A9B4F',
          DEFAULT: '#2B7A3B',
          dark: '#1E5C2B',
        },
        accent: {
          DEFAULT: '#D4620A',
          light: '#E8853A',
        },
        success: '#2A7A48',
        warning: '#B87D0C',
        danger: '#C0341D',
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
