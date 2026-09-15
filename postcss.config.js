export default {
  plugins: {
    // Must run first so @import is inlined before Tailwind processes layers.
    "postcss-import": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
