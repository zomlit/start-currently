import { defineConfig } from "@vinxi/config";

export default defineConfig({
  server: {
    force: true,
  },
  build: {
    target: "node16",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ["glob", "path-scurry", "archiver", "archiver-utils"],
    exclude: ["@currently/shared"],
    esbuildOptions: {
      target: "node16",
      platform: "node",
    },
  },
});
