import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    entry: {
      index: "src/index.ts",
      env: "src/env.ts",
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  env: {
    NODE_ENV: process.env.NODE_ENV || "development",
  },
  treeshake: true,
  tsconfig: "tsconfig.json",
  bundle: true,
  minify: false,
  skipNodeModulesBundle: true,
  shims: true,
  keepNames: true,
});
