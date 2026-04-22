/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        zvo: "#3b82f6",
        yvo: "#ef4444",
        cvo: "#10b981",
        vvo: "#f59e0b",
        mvo: "#8b5cf6",
      },
    },
  },
  plugins: [],
};
