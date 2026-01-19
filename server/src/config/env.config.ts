//server\src\config\env.config.ts

import { z } from 'zod';
import { getEnv } from './get-env.js';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().url(),

  // future-ready
  JWT_SECRET: z.string().min(10),
});

export const env = envSchema.parse({
  NODE_ENV: getEnv('NODE_ENV'),
  PORT: process.env.PORT,
  DATABASE_URL: getEnv('DATABASE_URL'),
  JWT_SECRET: getEnv('JWT_SECRET'),
});
