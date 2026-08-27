import { tailwindConfig } from '@storefront-ui/react/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [tailwindConfig],
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './node_modules/@storefront-ui/react/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#f3eee4',
        ink: '#1c1917',
        rule: '#d4cbbd',
        chilli: {
          DEFAULT: '#8b3a2a',
          dark: '#6f2c20',
        },
        primary: {
          50: '#f6efe8',
          100: '#ead9cc',
          200: '#d4b09a',
          300: '#c08a70',
          400: '#a85d45',
          500: '#8b3a2a',
          600: '#6f2c20',
          700: '#5a241a',
          800: '#3f1912',
          900: '#24100c',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
