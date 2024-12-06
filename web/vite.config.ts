import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), TanStackRouterVite(), tsconfigPaths()],
  ssr: {
    noExternal: ["@uiw/react-color", "@uiw/react-color-chrome"],
    // Add this to handle window is not defined errors
    optimizeDeps: {
      include: ["@uiw/react-color", "@uiw/react-color-chrome"],
    },
  },
  // Add this to handle SSR modules that need window
  resolve: {
    alias: {
      "@uiw/react-color": "@uiw/react-color/dist/esm",
      "@uiw/react-color-chrome": "@uiw/react-color-chrome/dist/esm",
    },
  },
});
