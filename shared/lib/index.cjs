'use strict';

var zod = require('zod');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var frontendEnvSchema = zod.z.object({
  VITE_API_URL: zod.z.string().url(),
  VITE_WEBSOCKET_URL: zod.z.string(),
  VITE_CLERK_PUBLISHABLE_KEY: zod.z.string(),
  VITE_SUPABASE_URL: zod.z.string().url(),
  VITE_SUPABASE_ANON_KEY: zod.z.string(),
  VITE_PUBLIC_GOOGLE_FONTS_API_KEY: zod.z.string()
});
var backendEnvSchema = zod.z.object({
  CLERK_JWT_VERIFICATION_KEY: zod.z.string(),
  CLERK_SECRET_KEY: zod.z.string(),
  DATABASE_URL: zod.z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: zod.z.string(),
  SPOTIFY_CLIENT_ID: zod.z.string(),
  SPOTIFY_CLIENT_SECRET: zod.z.string(),
  SPOTIFY_REDIRECT_URI: zod.z.string().url(),
  TWITCH_CLIENT_ID: zod.z.string(),
  TWITCH_CLIENT_SECRET: zod.z.string(),
  TWITCH_REDIRECT_URI: zod.z.string().url(),
  PORT: zod.z.string().or(zod.z.number()).transform(String),
  NODE_ENV: zod.z.enum(["development", "production", "test"])
});
var envSchema = zod.z.object({
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

exports.backendEnvSchema = backendEnvSchema;
exports.envSchema = envSchema;
exports.frontendEnvSchema = frontendEnvSchema;
exports.validateBackendEnv = validateBackendEnv;
exports.validateFrontendEnv = validateFrontendEnv;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map