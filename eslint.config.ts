import { defineConfig } from "eslint-define-config";

export default defineConfig({
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["**/dist/**", "**/node_modules/**"],
  settings: {
    "import/resolver": {
      typescript: {
        project: ["tsconfig.json", "packages/*/tsconfig.json"],
      },
    },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
});
