import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "node-server",
    env: {
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      ELYSIA_JWT_SECRET: process.env.ELYSIA_JWT_SECRET,
    },
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
