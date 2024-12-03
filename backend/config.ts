import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const config = {
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  JWT_SECRET: process.env.JWT_SECRET!,
  PORT: process.env.PORT || "9001",
  HOST: process.env.HOST || "localhost",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID!,
  TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET!,
};
