/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'app-gradient': "linear-gradient(to top, rgba(69,192,174,1), rgba(69,192,174,0.2))",
      },
    },
  },
  plugins: [],
};

