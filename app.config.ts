import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "bun",
  },
  vite: {
    plugins: [
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
    ],
    ssr: {
      noExternal: ["react-dom", "react-dom/server"],
    },
    optimizeDeps: {
      include: ["react-dom"],
    },
  },
});
