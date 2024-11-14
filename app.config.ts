import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";
import tsConfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: { preset: "node-server" },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: false,
    },
    plugins: [
      svgr({}),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      TanStackRouterVite({
        autoCodeSplitting: true,
      }) as any,
      visualizer({
        emitFile: true,
        filename: "test",
      }),
      react(),
    ],
  },
});
