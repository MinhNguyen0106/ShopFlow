import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().optional(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // JWT Security
  JWT_ACCESS_SECRET: z.string().min(16).default('shopflow_dev_jwt_access_secret_key_32chars_min!'),
  JWT_REFRESH_SECRET: z.string().min(16).default('shopflow_dev_jwt_refresh_secret_key_32chars_min!'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Meta Facebook Integration
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  FACEBOOK_VERIFY_TOKEN: z.string().default('shopflow_webhook_verify_token_dev'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const env: EnvConfig = envSchema.parse(process.env);
