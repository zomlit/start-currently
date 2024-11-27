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
    resolve: {
      alias: {
        "@": "/app",
        "@icons": "/app/icons",
      },
    },
  },
});
