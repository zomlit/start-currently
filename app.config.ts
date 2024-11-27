import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";

// Add environment variable validation
const requiredEnvVars = {
  production: [
    "VITE_PUBLIC_SUPABASE_URL",
    "VITE_PUBLIC_SUPABASE_ANON_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_PUBLISHABLE_KEY",
  ],
  development: ["VITE_PUBLIC_SUPABASE_URL", "VITE_PUBLIC_SUPABASE_ANON_KEY"],
};

// Only check env vars based on environment
const envVarsToCheck =
  requiredEnvVars[process.env.NODE_ENV as keyof typeof requiredEnvVars] ||
  requiredEnvVars.development;

// Check for missing environment variables
const missingEnvVars = envVarsToCheck.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables for ${process.env.NODE_ENV || "development"}:`
  );
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar}`);
  });
  process.exit(1);
}

export default defineConfig({
  server: {
    preset: "node-server",
    env: {
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      ELYSIA_JWT_SECRET: process.env.ELYSIA_JWT_SECRET,
    },
  },
  vite: {
    // Add environment variable handling
    define: {
      // Only include variables that are actually present
      ...(process.env.CLERK_PUBLISHABLE_KEY && {
        "process.env.CLERK_PUBLISHABLE_KEY": JSON.stringify(
          process.env.CLERK_PUBLISHABLE_KEY
        ),
      }),
      ...(process.env.CLERK_SECRET_KEY && {
        "process.env.CLERK_SECRET_KEY": JSON.stringify(
          process.env.CLERK_SECRET_KEY
        ),
      }),
      "process.env.VITE_PUBLIC_SUPABASE_URL": JSON.stringify(
        process.env.VITE_PUBLIC_SUPABASE_URL
      ),
      "process.env.VITE_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(
        process.env.VITE_PUBLIC_SUPABASE_ANON_KEY
      ),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },

    build: {
      target: "esnext",
      minify: "terser",
      cssMinify: true,
      modulePreload: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: [
          // Exclude extension files
          /\/app\/extensions\/.*/,
        ],
        output: {
          manualChunks(id) {
            // Bundle React and related packages together
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/scheduler") ||
              id.includes("node_modules/@tanstack") ||
              id.includes("node_modules/@clerk")
            ) {
              return "vendor";
            }

            // UI components and utilities
            if (
              id.includes("node_modules/@radix-ui") ||
              id.includes("node_modules/lucide-react") ||
              id.includes("node_modules/class-variance-authority") ||
              id.includes("node_modules/tailwind-merge")
            ) {
              return "ui";
            }
          },
        },
      },
    },

    // Optimize CSS
    css: {
      modules: {
        localsConvention: "camelCase",
      },
      devSourcemap: false,
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";',
        },
      },
    },

    // Optimize plugins
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
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

    // Optimize dependencies
    optimizeDeps: {
      exclude: ["app/extensions"],
      include: [
        "react",
        "react-dom",
        "@tanstack/react-query",
        "@clerk/tanstack-start",
        "@radix-ui/react-dialog",
        "@radix-ui/react-popover",
        "lucide-react",
      ],
      esbuildOptions: {
        target: "esnext",
        treeShaking: true,
        minify: true,
      },
    },

    // Optimize resolve
    resolve: {
      alias: {
        "@": "/app",
        "@icons": "/app/icons",
      },
    },
  },
});
