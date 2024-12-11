import { z } from "zod";

// Environment schema that's needed by both frontend and backend
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string(),
  // ... other env vars
});

export type Env = z.infer<typeof envSchema>;
