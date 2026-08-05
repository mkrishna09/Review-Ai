import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),

  NODE_ENV: z.enum(["development", "production", "test"]),

  DATABASE_URL: z.string().min(1),

  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),

  JWT_SECRET: z.string().min(32),

  FRONTEND_URL: z.string().url(),

  GEMINI_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  databaseUrl: env.DATABASE_URL,
  github: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY,
  },
};
