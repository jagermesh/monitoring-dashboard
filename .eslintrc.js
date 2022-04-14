module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2020: true,
    commonjs: true,
  },
  extends: [
    'eslint:recommended',
  ],
  globals: {
    $: 'readonly',
    Handlebars: 'readonly',
  },
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
  },
};
