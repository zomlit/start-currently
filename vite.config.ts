import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      external: [
        // Exclude extension files from the build
        /\/app\/extensions\/.*/,
      ],
    },
  },
  optimizeDeps: {
    exclude: ["app/extensions"],
  },
});
