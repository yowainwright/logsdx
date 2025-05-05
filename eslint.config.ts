import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    ignores: ["**/dist/**", "**/node_modules/**", "**/ops/**", "**/scripts/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: ["./tsconfig.json"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended?.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  // Add a separate configuration for eslint.config.ts itself
  {
    files: ["eslint.config.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        // Don't use project for this file
        project: null,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Use a minimal set of rules for the config file
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
