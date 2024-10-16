/// <reference types="vite-plugin-svgr/client" />

import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": "/app",
    },
  },
  publicDir: "public",
  ssr: {
    noExternal: ["stripe", "react-dom", "react-dom/server"],
  },
  optimizeDeps: {
    include: ["react-dom"],
  },
});
