/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */

import { z } from "zod";

const PUBLIC_ENV_PREFIX = "VITE_" as const;

const publicSchema = createEnvSchema("Public", {
  VITE_BASE_URL: z.string().url(),
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  VITE_CLERK_SIGN_IN_URL: z.string(),
  VITE_CLERK_SIGN_UP_URL: z.string(),
  VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string(),
  VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string(),
  VITE_CONVEX_URL: z.string().url(),
  VITE_ELYSIA_API_URL: z.string().url(),
  VITE_ELYSIA_WS_URL: z.string(),
  VITE_OPENAI_API_KEY: z.string(),
  VITE_PUBLIC_APP_URL: z.string().url(),
  VITE_PUBLIC_GOOGLE_FONTS_API_KEY: z.string(),
  VITE_STRIPE_PUBLISHABLE_KEY_LIVE: z.string(),
  VITE_STRIPE_PUBLISHABLE_KEY_TEST: z.string(),
  VITE_STRIPE_SECRET_KEY_LIVE: z.string(),
  VITE_STRIPE_SECRET_KEY_TEST: z.string(),
  VITE_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  VITE_PUBLIC_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  VITE_TWITCH_CLIENT_ID: z.string(),
  VITE_TWITCH_CLIENT_SECRET: z.string(),
});

const privateSchema = createEnvSchema("Private", {
  CLERK_PUBLIC_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  DATABASE_URL: z.string(),
  ELYSIA_JWT_SECRET: z.string(),
  SUPABASE_JWT_SECRET: z.string(),
  SUPABASE_URL: z.string().url(),
});

function parseEnv() {
  const result = z
    .object({
      ...publicSchema.shape,
      ...privateSchema.shape,
    })
    .safeParse({
      ...import.meta.env,
      ...process.env,
    });

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables");
  }

  const total = Object.keys(result.data).length;
  console.info(`✅ Environment variables validated (${total} variables)`);
}

function createEnvSchema<Shape extends z.ZodRawShape>(
  type: "Public" | "Private",
  shape: Shape
) {
  for (const key in shape) {
    if (type === "Public" && !key.startsWith(PUBLIC_ENV_PREFIX)) {
      throw new Error(
        `Public environment variables must start with "${PUBLIC_ENV_PREFIX}", got "${key}"`
      );
    }

    if (type === "Private" && key.startsWith(PUBLIC_ENV_PREFIX)) {
      throw new Error(
        `Private environment variables must not start with "${PUBLIC_ENV_PREFIX}", got "${key}"`
      );
    }
  }

  return z.object(shape);
}

type ViteBuiltInEnv = {
  MODE: "development" | "production" | "test";
  DEV: boolean;
  SSR: boolean;
  PROD: boolean;
  BASE_URL: string;
};

declare global {
  interface ImportMetaEnv
    extends z.infer<typeof publicSchema>,
      ViteBuiltInEnv {}

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof privateSchema> {}
  }
}

export { parseEnv };
