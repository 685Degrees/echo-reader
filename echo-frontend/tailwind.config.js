/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f4f4f2",
          100: "#e4e2dd",
          200: "#cac7be",
          300: "#aca698",
          400: "#948b7b",
          500: "#857b6d",
          600: "#72675c",
          700: "#5c534c",
          800: "#504843",
          900: "#453e3b",
          950: "#272321",
        },
      },
    },
  },
  plugins: [],
};
