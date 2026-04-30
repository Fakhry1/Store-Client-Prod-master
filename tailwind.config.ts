import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-kufi)', 'Segoe UI', 'Tahoma', 'sans-serif'],
        kufi:    ['var(--font-kufi)', 'Segoe UI', 'Tahoma', 'sans-serif'],
        display: ['var(--font-kufi)', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      colors: {
        ink:        '#0A1F44',
        'ink-2':    '#0E2A5C',
        orange:     '#FF6B2C',
        'orange-2': '#FF8A4A',
        champagne:  '#E8C99B',
        paper:      '#F5F2EC',
        'paper-2':  '#EAE5DA',
        mute:       '#6B7591',
        brand: {
          DEFAULT: '#0A1F44',
          orange:  '#FF6B2C',
          paper:   '#F5F2EC',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(10,31,68,0.10)',
      },
      boxShadow: {
        'card':   '0 2px 12px rgba(10,31,68,0.06), 0 1px 3px rgba(10,31,68,0.04)',
        'card-lg':'0 12px 32px rgba(10,31,68,0.10)',
        'nav':    '0 -4px 24px rgba(10,31,68,0.07)',
        'orange': '0 4px 14px rgba(255,107,44,0.30)',
      },
    },
  },
  plugins: [],
}

export default config
