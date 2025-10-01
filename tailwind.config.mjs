/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "brand-blue": "#476eae",
        "brand-cyan": "#48b3af",
        "brand-green": "#a7e399",
        "brand-yellow": "#f6ff99",
        "brand-bg": "#f8f7f4",
        "brand-gray": "#e5e7eb",
        "brand-black": "#2e2d2d",
      },
      fontFamily: {
        bricolage: ['"Bricolage Grotesque"', "sans-serif"],
        rubik: ["Rubik", "sans-serif"],
      },
    },
  },
  plugins: [],
};
