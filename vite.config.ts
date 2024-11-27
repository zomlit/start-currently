import { defineConfig } from "vite";
import { resolve } from "path";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    // Optimize build
    target: "esnext",
    minify: "terser",
    cssMinify: true,
    modulePreload: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      external: [
        // Exclude extension files from the build
        /\/app\/extensions\/.*/,
      ],
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "@tanstack/react-query",
            "@clerk/tanstack-start",
          ],
          ui: ["@radix-ui/*", "lucide-react"],
        },
      },
    },
  },

  // Optimize dev server
  server: {
    hmr: {
      protocol: "ws",
    },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/dist/**"],
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query"],
    exclude: ["app/extensions"],
  },

  // Disable sourcemaps in production
  css: {
    devSourcemap: false,
  },
});
