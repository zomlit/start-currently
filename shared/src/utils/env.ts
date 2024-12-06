import { z } from "zod";
import type { Env } from "../types/env";

// Env schema validation
export const envSchema = z.object({
  // API URLs
  VITE_ELYSIA_API_URL: z.string().url(),
  VITE_API_URL: z.string().url(),
  VITE_WEBSOCKET_URL: z.string(),

  // Authentication
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string(),

  // External APIs
  VITE_PUBLIC_GOOGLE_FONTS_API_KEY: z.string(),

  // Spotify
  VITE_SPOTIFY_CLIENT_ID: z.string(),
  VITE_SPOTIFY_CLIENT_SECRET: z.string(),
  VITE_SPOTIFY_REDIRECT_URI: z.string().url(),

  // Twitch
  VITE_TWITCH_CLIENT_ID: z.string(),
  VITE_TWITCH_CLIENT_SECRET: z.string(),
  VITE_TWITCH_REDIRECT_URI: z.string().url(),

  // Backend
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
});

// Helper to validate env vars
export function validateEnv(env: Record<string, unknown>): Env {
  return envSchema.parse(env);
}

// Utility function to get env vars with default values
export const getEnvVar = (
  key: keyof ImportMetaEnv,
  defaultValue?: string
): string => {
  const value = import.meta.env[key] || process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};
