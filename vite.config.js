import { defineConfig } from "vite";

export default defineConfig({
  // ... other config
  build: {
    rollupOptions: {
      external: [
        "node:async_hooks",
        // Add other Node.js built-ins here
      ],
    },
  },
});
