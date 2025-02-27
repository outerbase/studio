import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import pkg from "./../package.json";

export const appVersion = pkg.version;

export const env = createEnv({
  server: {
    BASE_URL: z.string().min(1).optional(),

    DATABASE_URL: z.string().min(1).optional(),
    DATABASE_AUTH_TOKEN: z.string().min(1).optional(),

    DATABASE_ANALYTIC_URL: z.string().optional(),
    DATABASE_ANALYTIC_AUTH_TOKEN: z.string().optional(),

    ENCRYPTION_KEY: z.string().min(30).optional(),
  },

  experimental__runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_ANALYTIC_URL: process.env.DATABASE_ANALYTIC_URL,
    DATABASE_ANALYTIC_AUTH_TOKEN: process.env.DATABASE_ANALYTIC_AUTH_TOKEN,
  },
});
