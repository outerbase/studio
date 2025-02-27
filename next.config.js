/* eslint-disable @typescript-eslint/no-var-requires */
const withMDX = require("@next/mdx")();
const pkg = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  env: {
    NEXT_PUBLIC_STUDIO_VERSION: pkg.version,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_OB_API ?? "https://app.dev.outerbase.com/api/v1"}/:path*`,
      },
    ];
  },
};

module.exports = { ...withMDX(nextConfig), output: "standalone" };
