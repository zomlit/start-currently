import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";
import babel from "vite-plugin-babel";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
    resolve: {
      alias: {
        "@": resolve(__dirname, "./app"),
        "@icons": resolve(__dirname, "./app/icons"),
      },
    },
    build: {
      target: "esnext",
      minify: "terser",
      cssMinify: true,
      assetsDir: "assets",
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name]-[hash][extname]",
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
        },
      },
    },
    plugins: [
      tsConfigPaths(),
      babel({
        filter: /\.[jt]sx?$/,
        babelConfig: {
          presets: [
            ["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
          ],
          plugins: [
            [
              "babel-plugin-react-compiler",
              {
                debug: true,
                verbose: true,
                runtime: true,
              },
            ],
          ],
        },
      }),
      svgr({
        svgrOptions: {
          icon: true,
          svgo: true,
          plugins: ["@svgr/plugin-jsx"],
        },
      }),
      TanStackRouterVite(),
    ],
  },
});
