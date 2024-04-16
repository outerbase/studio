/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@libsqlstudio/gui"],
  experimental: {
    turbo: {
      resolveAlias: {
        "@libsqlstudio/gui/driver": "../gui/src/driver.ts",
        "@libsqlstudio/gui": "../gui/src/index.tsx",
      },
    },
  },
};

module.exports = nextConfig;
