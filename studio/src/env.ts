import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import pkg from "./../package.json";

export const appVersion = pkg.version;

export const env = createEnv({
  server: {
    BASE_URL: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().min(1),

    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    ENCRYPTION_KEY: z.string().min(30),

    // R2
    // Don't include the bucket name in the URL
    R2_URL: z.string().optional(),
    R2_PUBLIC_URL: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_ACCESS_KEY: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
  },
  experimental__runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    // R2
    R2_URL: process.env.R2_URL,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_ACCESS_KEY: process.env.R2_ACCESS_KEY,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  },
});
