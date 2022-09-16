const tailwindConfig = require('@okuni/tailwindcss-config/tailwind.config')

module.exports = {
  ...tailwindConfig,
  content: [
    '../../packages/ui/components/**/*.{ts,tsx}',
    './{pages,src}/**/*.{ts,tsx}',
  ],
}
