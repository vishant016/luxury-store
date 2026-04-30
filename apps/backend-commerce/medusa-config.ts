import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const isProd = process.env.NODE_ENV === "production";

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val && isProd) throw new Error(`Missing required env var: ${key}`);
  return val ?? "";
}

const useS3 = Boolean(process.env.S3_ACCESS_KEY_ID && process.env.S3_BUCKET);

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
  modules: useS3
    ? [
        {
          resolve: "@medusajs/file",
          options: {
            providers: [
              {
                resolve: "@medusajs/file-s3",
                id: "s3",
                options: {
                  file_url: process.env.S3_FILE_URL,
                  access_key_id: process.env.S3_ACCESS_KEY_ID,
                  secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                  region: process.env.S3_REGION,
                  bucket: process.env.S3_BUCKET,
                  endpoint: process.env.S3_ENDPOINT,
                },
              },
            ],
          },
        },
      ]
    : [],
})
