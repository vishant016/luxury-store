import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const allowLocalMedusa =
  isDev || process.env.NEXT_IMAGE_ALLOW_LOCAL_IP === "true";

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "";
let backendHost: { protocol: "http" | "https"; hostname: string; port?: string } | null = null;
try {
  const u = new URL(backendUrl);
  if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") {
    backendHost = {
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      port: u.port || undefined,
    };
  }
} catch {}

// Cloudflare R2 public domain from env (e.g. pub-xxxx.r2.dev or custom domain)
const r2FileUrl = process.env.NEXT_PUBLIC_R2_FILE_URL ?? "";
let r2Host: { hostname: string } | null = null;
try {
  const u = new URL(r2FileUrl);
  if (u.hostname) r2Host = { hostname: u.hostname };
} catch {}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: allowLocalMedusa,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // R2 public domain — set NEXT_PUBLIC_R2_FILE_URL in Vercel env vars
      ...(r2Host
        ? [
            {
              protocol: "https" as const,
              hostname: r2Host.hostname,
              pathname: "/**",
            },
          ]
        : []),
      // Railway backend static files
      ...(backendHost
        ? [
            {
              protocol: backendHost.protocol,
              hostname: backendHost.hostname,
              ...(backendHost.port ? { port: backendHost.port } : {}),
              pathname: "/static/**",
            },
          ]
        : []),
      ...(isDev
        ? [
            {
              protocol: "http" as const,
              hostname: "localhost",
              port: "9000",
              pathname: "/static/**",
            },
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "9000",
              pathname: "/static/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
