/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        magenta: "#ff1972",
        softmagenta: "#ff5aa6",
        darkbg: "#0f1724",
        pale: "#fff6fb"
      },
      borderRadius: {
        'xl-2': '18px'
      }
      
    }
  },
  plugins: []
};
