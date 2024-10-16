// app.config.ts
import { defineConfig } from "@vinxi/config";
import { react } from "@vinxi/react";
import viteTsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  plugins: [react()],
  server: {
    preset: "bun"
  },
  routes: [
    {
      name: "public",
      base: "/",
      handler: "app/public.ts"
    },
    {
      name: "ssr",
      base: "/",
      handler: "app/ssr.tsx"
    }
  ],
  vite: {
    plugins: [
      viteTsConfigPaths({
        projects: ["./tsconfig.json"]
      })
    ],
    build: {
      outDir: "dist",
      manifest: true
    }
  }
});
export {
  app_config_default as default
};
