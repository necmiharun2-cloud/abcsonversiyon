const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script'
    },
    rules: {
      'no-console': 'off'
    }
  }
];

