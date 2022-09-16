const tailwindConfig = require('@okuni/tailwindcss-config/tailwind.config')

module.exports = {
  ...tailwindConfig,
  content: [
    './components/**/*.{ts,tsx}',
  ],
}
