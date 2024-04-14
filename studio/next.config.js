/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@libsqlstudio/gui"],
  experimental: {
    turbo: {
      resolveAlias: {
        "@libsqlstudio/gui": "../gui/src/index.tsx",
      },
    },
  },
};

module.exports = nextConfig;
