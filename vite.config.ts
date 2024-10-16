/// <reference types="vite-plugin-svgr/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    svgr({
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/app",
    },
  },
  publicDir: "public",
  ssr: {
    noExternal: ["@clerk/clerk-react"],
  },
});
