export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        browser: true,
        es2021: true,
        node: true,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
];
