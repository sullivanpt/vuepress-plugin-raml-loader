module.exports = {
  root: true,
  extends: 'vuepress',
  overrides: [
    {
      files: ['test/**/*.js'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
}
