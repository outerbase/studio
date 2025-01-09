/* eslint-disable @typescript-eslint/no-var-requires */
const withMDX = require("@next/mdx")();
const pkg = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  env: {
    NEXT_PUBLIC_STUDIO_VERSION: pkg.version,
  },
  headers: async () => {
    return [
      {
        source: "/api/events",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
        ],
      },
    ];
  },
};

module.exports = withMDX(nextConfig);
