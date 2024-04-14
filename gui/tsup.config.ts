import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: ["./src/index.tsx"],
  format: ["esm", "cjs"],
  splitting: true,
  sourcemap: true,
  minify: !opts.watch,
  clean: !opts.watch,
  external: ["react", "react-dom", "next"],
  platform: "browser",
  dts: true,
  loader: {
    ".css": "local-css",
  },
  outDir: "dist",
}));
