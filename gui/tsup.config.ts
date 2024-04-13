import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: ["./src/index.tsx"],
  format: ["esm"],
  splitting: true,
  sourcemap: true,
  minify: !opts.watch,
  clean: !opts.watch,
  external: ["react", "react-dom"],
  dts: true,
  outDir: "dist",
}));
