import 'dotenv/config';

import { z } from 'zod';

const booleanFromString = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return value;
}, z.boolean());

const numberFromString = z.preprocess((value) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return value;
}, z.number().int().positive());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: numberFromString.default(4000),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  CORS_ORIGIN: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN_MINUTES: numberFromString.default(15),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: numberFromString.default(7),
  REFRESH_COOKIE_NAME: z.string().min(1).default('task_platform_refresh'),
  COOKIE_SECURE: booleanFromString.default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  BCRYPT_SALT_ROUNDS: numberFromString.default(12),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  ENABLE_REDIS_CACHE: booleanFromString.default(false),
  ENABLE_TOKEN_CLEANUP_JOB: booleanFromString.default(true),
  TOKEN_CLEANUP_CRON: z.string().min(1).default('0 * * * *'),
});

export const env = envSchema.parse(process.env);

export const isProduction = env.NODE_ENV === 'production';
