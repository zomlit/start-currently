import { z } from 'zod';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var frontendEnvSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_WEBSOCKET_URL: z.string(),
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string(),
  VITE_PUBLIC_GOOGLE_FONTS_API_KEY: z.string()
});
var backendEnvSchema = z.object({
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
  NODE_ENV: z.enum(["development", "production", "test"])
});
var envSchema = z.object({
  ...frontendEnvSchema.shape,
  ...backendEnvSchema.shape
});
function validateFrontendEnv(env) {
  return frontendEnvSchema.parse(env);
}
__name(validateFrontendEnv, "validateFrontendEnv");
function validateBackendEnv(env) {
  return backendEnvSchema.parse(env);
}
__name(validateBackendEnv, "validateBackendEnv");

export { backendEnvSchema, envSchema, frontendEnvSchema, validateBackendEnv, validateFrontendEnv };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map