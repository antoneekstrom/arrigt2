/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
    fontFamily: {
      sans: "Poppins",
      serif: "Playfair Display"
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    }
  },
  plugins: [
    require("tailwindcss-react-aria-components")
  ],
}

