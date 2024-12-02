import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";
import babel from "vite-plugin-babel";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
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
    define: {
      "process.env.VITE_PUBLIC_SUPABASE_URL": JSON.stringify(
        process.env.VITE_PUBLIC_SUPABASE_URL
      ),
      "process.env.VITE_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(
        process.env.VITE_PUBLIC_SUPABASE_ANON_KEY
      ),
      "process.env.REACT_COMPILER": JSON.stringify(true),
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
