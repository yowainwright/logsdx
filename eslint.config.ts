import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.ts"],
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/ops/**",
      "**/scripts/**",
      "**/*.test.ts",
    ],
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
  // Configuration for files outside the main TypeScript project
  {
    files: ["examples/**/*.ts", "tests/**/*.ts", "site/**/*.ts"],
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        // Don't use project for these files since they're not in tsconfig.json
        project: null,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Use a more relaxed set of rules for examples and tests
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
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
