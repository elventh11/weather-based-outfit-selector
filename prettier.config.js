/**
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  jsxSingleQuote: true,
  singleQuote: true,
  bracketSameLine: true,
  tabWidth: 2,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindAttributes: ['class', 'className'],
  tailwindFunctions: ['clsx', 'cn'],
};

export default config;
