/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: {
          950: '#060810',
          900: '#0B0E18',
          800: '#111525',
          700: '#1A2038',
          600: '#242D4B',
        },
        claw: {
          red: '#FF2D2D',
          orange: '#FF6B35',
          ember: '#FF4500',
          glow: '#FF6347',
        },
        biolum: {
          cyan: '#00E5FF',
          teal: '#00BCD4',
          blue: '#40C4FF',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
