import { defineConfig } from "vinxi";

export default defineConfig({
  server: {
    preset: "bun",
  },
  vite: {
    ssr: {
      noExternal: ["react-dom", "react-dom/server"],
    },
    optimizeDeps: {
      include: ["react-dom"],
    },
  },
});
