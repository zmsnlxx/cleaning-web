module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: [
    'plugin:vue/recommended',
    'eslint:recommended',
  ],

  parserOptions: {
    ecmaVersion: 2020,
  },

  globals: {
    router: 'readonly',
    store: 'readonly',
    _: 'readonly',
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unused-vars': 'off',
    'no-trailing-spaces': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/no-v-html': 'off',
  },
}
