import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      // Add these options to help prevent the preamble detection issue
      fastRefresh: true,
      babel: {
        parserOpts: {
          plugins: ["jsx", "typescript"],
        },
      },
    }),
  ],
  // Add optimization settings
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: ["@clerk/clerk-react"],
  },
  build: {
    sourcemap: true,
    // Improve code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
        },
      },
    },
  },
});
