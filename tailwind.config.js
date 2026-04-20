/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1D9E75", light: "#5DCAA5", dark: "#0F6E56" },
        secondary: { DEFAULT: "#534AB7", light: "#AFA9EC", dark: "#3C3489" },
      },
    },
  },
  plugins: [],
};
