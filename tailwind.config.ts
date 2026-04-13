import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['var(--font-kufi)', 'Noto Kufi Arabic', 'sans-serif'],
        kufi:  ['var(--font-kufi)', 'Noto Kufi Arabic', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'var(--font-kufi)', 'Noto Kufi Arabic', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
