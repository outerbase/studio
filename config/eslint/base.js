/** @type {import('eslint').Linter.Config} */
const config = {
  ignorePatterns: ["node_modules", "dist", ".next"],
  env: {
    es2022: true,
    node: true,
  },
  extends: ["plugin:eslint-comments/recommended", "prettier"],
  overrides: [
    {
      files: [
        "**/*.ts",
        "**/*.tsx",
        "**/*.js",
        "**/*.jsx",
        "**/*.mjs",
        "**/*.cjs",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: true,
      },
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
      ],
      rules: {
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/array-type": [
          "error",
          {
            default: "array-simple",
            readonly: "array-simple",
          },
        ],
        "@typescript-eslint/consistent-type-imports": [
          "warn",
          {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
          },
        ],
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/require-await": "error",
        "@typescript-eslint/no-misused-promises": [
          "error",
          {
            checksVoidReturn: { attributes: false },
          },
        ],
      },
    },
  ],
};

module.exports = config;
