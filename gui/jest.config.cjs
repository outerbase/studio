/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: "./",
  moduleNameMapper: {
    "^@gui/(.*)$": "<rootDir>/src/$1",
  },
};
