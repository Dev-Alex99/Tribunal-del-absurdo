/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bureau: {
          bg: '#e2d7c3',
          desk: '#2c251e',
          folder: '#d8caa7',
          folderDark: '#bfae87',
          paper: '#f9f6ee',
          paperAged: '#ece4d0',
          paperLine: '#d5cab3',
          ink: '#1c1a17',
          inkMuted: '#4a463f',
          inkFaded: '#7a7469',
          stampRed: '#8f1d1d',
          stampRedFaded: '#b23b3b',
          stampBlue: '#1e2b47',
          stampGreen: '#234931',
          ribbon: '#991b1b',
          tape: '#e4d39c',
        }
      },
      fontFamily: {
        typewriter: ['"Courier Prime"', '"Special Elite"', 'Courier', 'monospace'],
        stamp: ['"Special Elite"', '"Impact"', 'monospace'],
      },
      boxShadow: {
        'bureau-sm': '2px 2px 0px #1c1a17',
        'bureau': '4px 4px 0px #1c1a17',
        'bureau-lg': '6px 6px 0px #1c1a17',
        'bureau-pressed': '1px 1px 0px #1c1a17',
        'paper-stack': '3px 3px 0px rgba(44, 37, 30, 0.4), 6px 6px 0px rgba(44, 37, 30, 0.2)',
      }
    },
  },
  plugins: [],
}
