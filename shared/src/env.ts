import { z } from "zod";

// Frontend env schema
export const frontendEnvSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_WEBSOCKET_URL: z.string(),
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string(),
  VITE_PUBLIC_GOOGLE_FONTS_API_KEY: z.string(),
});

// Backend env schema
export const backendEnvSchema = z.object({
  CLERK_JWT_VERIFICATION_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  SPOTIFY_REDIRECT_URI: z.string().url(),
  TWITCH_CLIENT_ID: z.string(),
  TWITCH_CLIENT_SECRET: z.string(),
  TWITCH_REDIRECT_URI: z.string().url(),
  PORT: z.string().or(z.number()).transform(String),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

// Combined schema for type inference
export const envSchema = z.object({
  ...frontendEnvSchema.shape,
  ...backendEnvSchema.shape,
});

// Export environment type
export type Environment = z.infer<typeof envSchema>;

// Helper to validate frontend env
export function validateFrontendEnv(env: Record<string, unknown>) {
  return frontendEnvSchema.parse(env);
}

// Helper to validate backend env
export function validateBackendEnv(env: Record<string, unknown>) {
  return backendEnvSchema.parse(env);
}

export const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const clientSchema = z.object({
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
