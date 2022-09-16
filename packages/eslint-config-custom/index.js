module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "semi": ["error", "never"],
    "react/jsx-key": "off",
    "object-curly-spacing": ["error", "always"]
  },
}
