import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define a schema for environment variables
const envSchema = z.object({
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  DEBUG_MODE: z.string().optional().default('false'),
  FROM_EMAIL: z.string(),
  REPLY_EMAIL: z.string(),
  ENCRYPTION_KEY: z.string(),
  ENCRYPTION_IV: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_BUCKET_REGION: z.string(),
  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  FILE_SIZE: z.number().default(100),
  COINGECKO_API_KEY: z.string(),
  RESEND_API: z.string(),
});

// Validate the environment variables
const parsedEnv = envSchema.parse(process.env);

// Export validated variables
export const {
  JWT_SECRET,
  PORT,
  DATABASE_URL,
  DEBUG_MODE,
  FROM_EMAIL,
  REPLY_EMAIL,
  ENCRYPTION_KEY,
  ENCRYPTION_IV,
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  FILE_SIZE,
  COINGECKO_API_KEY,
  RESEND_API,
} = parsedEnv;
