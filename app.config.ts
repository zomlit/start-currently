import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "bun",
  },
  vite: {
    build: {
      target: "esnext",
      minify: "terser",
      cssMinify: true,
      assetsDir: "assets",
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name]-[hash][extname]",
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
        },
      },
    },
    publicDir: "public",
    assetsInclude: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.webp"],
    resolve: {
      alias: {
        "@": "/app",
        "@icons": "/app/icons",
        "@assets": "/app/assets",
        "@gamepad": "/app/assets/gamepad",
      },
    },
    plugins: [
      tsConfigPaths(),
      svgr({
        svgrOptions: {
          icon: true,
          svgo: true,
          plugins: ["@svgr/plugin-jsx"],
        },
      }),
      TanStackRouterVite(),
    ],
  },
});
