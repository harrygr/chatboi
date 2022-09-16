// See the Tailwind configuration guide for advanced usage
// https://tailwindcss.com/docs/configuration

module.exports = {
  content: [
    "./ts/**/*.ts",
    "./ts/**/*.tsx",
    "../lib/*_web.ex",
    "../lib/*_web/**/*.*ex",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
