import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4844E2',
        accent: '#1AD882',
      },
    },
  },
  plugins: [],
} satisfies Config
