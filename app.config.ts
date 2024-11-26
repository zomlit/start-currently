import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  hmr: {
    overlay: false,
  },
  vite: {
    css: {
      modules: {
        localsConvention: "camelCase",
      },
    },
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
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
  build: {
    cache: {
      enabled: true,
      paths: ["node_modules", ".vinxi", ".output", "/root/.bun"],
    },
  },
});
