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
        sans:  ['var(--font-kufi)', 'sans-serif'],
        kufi:  ['var(--font-kufi)', 'sans-serif'],
        display: ['var(--font-playfair)', 'var(--font-kufi)', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
