// server/src/config/env.config.ts

import { z } from "zod";
import { getEnv } from "./get-env.js";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse({
  NODE_ENV: getEnv("NODE_ENV"),
  PORT: getEnv("PORT"),
  DATABASE_URL: getEnv("DATABASE_URL"),
});
