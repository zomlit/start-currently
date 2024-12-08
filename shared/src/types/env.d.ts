import { z } from "zod";
import { envSchema } from "../env";

export type Environment = z.infer<typeof envSchema>;

declare global {
  interface ImportMetaEnv extends Environment {}
}
