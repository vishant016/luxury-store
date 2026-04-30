import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const isProd = process.env.NODE_ENV === "production";

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val && isProd) throw new Error(`Missing required env var: ${key}`);
  return val ?? "";
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: requireEnv("JWT_SECRET", isProd ? undefined : "supersecret"),
      cookieSecret: requireEnv("COOKIE_SECRET", isProd ? undefined : "supersecret"),
    },
  },
})
