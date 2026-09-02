import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().default(4000),

    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
    GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),

    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters long"),
    ENCRYPTION_KEY: z
      .string()
      .min(32, "ENCRYPTION_KEY must be at least 32 characters long")
      .optional(),

    API_URL: z
      .string()
      .url("API_URL must be a valid URL")
      .default("http://localhost:4000"),
    FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),

    USE_MOCK_AI: z.string().default("false"),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

    REDIS_HOST: z.string().default("127.0.0.1"),
    REDIS_PORT: z.coerce.number().default(6379),
  })
  .superRefine((data, ctx) => {
    const isMock = data.USE_MOCK_AI === "true" || data.USE_MOCK_AI === "1";
    if (
      !isMock &&
      (!data.GEMINI_API_KEY || data.GEMINI_API_KEY.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GEMINI_API_KEY is required when USE_MOCK_AI is not true",
        path: ["GEMINI_API_KEY"],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedErrors = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(
    "❌ Environment configuration validation failed:\n" + formattedErrors,
  );
  process.exit(1);
}

const env = parsed.data;

export default {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  databaseUrl: env.DATABASE_URL,
  github: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY ?? "",
    model: env.GEMINI_MODEL,
  },
  ai: {
    useMockAi: env.USE_MOCK_AI === "true" || env.USE_MOCK_AI === "1",
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  jwtSecret: env.JWT_SECRET,
  encryptionKey: env.ENCRYPTION_KEY ?? env.JWT_SECRET,

  apiUrl: env.API_URL,
  frontendUrl: env.FRONTEND_URL,
};
