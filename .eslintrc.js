module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `@okuni/eslint-config`
  extends: ['@okuni/eslint-config'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
}
