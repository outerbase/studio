/** @type {import('eslint').Linter.Config} */
const config = {
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
      extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        // "plugin:jsx-a11y/recommended",
      ],
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react/no-unknown-property": "warn"
      },
    },
  ],
};

module.exports = config;
