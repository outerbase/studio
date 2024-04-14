/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: ["libsqlstudio/base", "libsqlstudio/react"],
  rules: {
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/prefer-includes": "off",
    "@typescript-eslint/prefer-promise-reject-errors": "off",
    "@typescript-eslint/no-confusing-void-expression": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/no-base-to-string": "off",
    "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
  },
};
