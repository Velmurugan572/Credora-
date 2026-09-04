/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        credora: {
          navy: '#09192C',
          dark: '#05101C',
          emerald: '#006C49',
          mint: '#00C885',
          'mint-light': '#6CF8BB',
          'mint-soft': '#E6FAF2',
          surface: '#F8FAFC',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#475569',
        },
        primary: '#09192C',
        secondary: '#006C49',
        'secondary-mint': '#00C885',
        'secondary-fixed': '#6CF8BB',
        background: '#F8FAFC',
        'on-background': '#0F172A',
        surface: '#F8FAFC',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F1F5F9',
        'surface-container': '#E2E8F0',
        'on-surface': '#0F172A',
        'on-surface-variant': '#475569',
        'outline-variant': '#CBD5E1',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'credora-sm': '0 1px 3px rgba(9, 25, 44, 0.05), 0 1px 2px rgba(9, 25, 44, 0.03)',
        'credora-card': '0 4px 20px -2px rgba(9, 25, 44, 0.06), 0 2px 6px -1px rgba(9, 25, 44, 0.04)',
        'credora-glow': '0 0 40px rgba(0, 200, 133, 0.25)',
      }
    },
  },
  plugins: [],
}
