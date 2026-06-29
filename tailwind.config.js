/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
  extend: {
    colors: {
      bg: '#F4F4F3',
      surface: '#FFFFFF',
      dark: '#0E1F1C',
      'dark-2': '#16302C',
      'text-primary': '#16191A',
      'text-secondary': '#8C9290',
      border: '#E9E9E7',
      'map-bg': '#DCDEDC',
      'map-road': '#EFF0EE',
      'map-park': '#C9DDC8',
      'accent-blue': '#3F7CF6',
      'accent-green': '#6FCF97',
      'accent-dark': '#0E1F1C'
    },
    borderRadius: {
      card: '14px',
      sheet: '24px',
      pill: '999px',
    },
  },
},
  plugins: [],
};