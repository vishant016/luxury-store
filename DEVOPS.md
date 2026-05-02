# DevOps Guide — Luxury Store

This document covers everything needed to run the project locally and deploy it to production.  
Architecture: **Medusa v2** backend on **Railway** + **Next.js** storefront on **Vercel**.

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Tech Stack](#2-tech-stack)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Database Migrations & Seeding](#5-database-migrations--seeding)
6. [Production Deployment — Backend (Railway)](#6-production-deployment--backend-railway)
7. [Production Deployment — Frontend (Vercel)](#7-production-deployment--frontend-vercel)
8. [Image Storage — Cloudflare R2](#8-image-storage--cloudflare-r2)
9. [Creating an Admin User](#9-creating-an-admin-user)
10. [CORS Configuration](#10-cors-configuration)
11. [Useful Commands](#11-useful-commands)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Repository Structure

```
luxury-store/                   ← root of the monorepo (one GitHub repo)
  apps/
    storefront/                 ← Next.js 16 (App Router) — deployed to Vercel
    backend-commerce/           ← Medusa v2 — deployed to Railway
  docker-compose.yml            ← local Postgres + Redis only
  DEVOPS.md                     ← this file
```

Both apps live in one GitHub repo. Vercel and Railway each watch the same repo but build from different subdirectories.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Storefront | Next.js 16, TypeScript, Tailwind CSS v4, Zustand, Framer Motion |
| Backend | Medusa v2 (Node.js), TypeScript |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| File Storage | Cloudflare R2 (S3-compatible, free tier) |
| Storefront hosting | Vercel |
| Backend hosting | Railway |
| Container runtime | Docker (local dev) / Railway Dockerfile build |

---

## 3. Local Development Setup

### Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **npm 10+** (comes with Node)
- **Docker Desktop** — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Git**

### Step 1 — Clone the repo

```bash
git clone https://github.com/vishant016/luxury-store.git
cd luxury-store
```

### Step 2 — Start Postgres and Redis

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on `localhost:5432` (DB: `medusa_db`, user: `medusa_user`, pass: `medusa_pass`)
- **Redis** on `localhost:6379`

Verify containers are running:

```bash
docker compose ps
```

### Step 3 — Set up the Backend

```bash
cd apps/backend-commerce
```

Create your local `.env` file (copy from template):

```bash
# Windows CMD
copy .env.template .env

# Mac / Linux
cp .env.template .env
```

The default `.env` is pre-configured for Docker local setup:

```env
DATABASE_URL=postgres://medusa_user:medusa_pass@localhost:5432/medusa_db
REDIS_URL=redis://localhost:6379
STORE_CORS=http://localhost:3000,https://docs.medusajs.com
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:3000
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

Install dependencies:

```bash
npm install
```

Run database migrations:

```bash
npx medusa db:migrate
```

Seed the database with products, categories, regions, and shipping options:

```bash
npx medusa exec src/migration-scripts/initial-data-seed.ts
```

At the end of the seed output, you will see a **Publishable API Key**:

```
Publishable API Key: pk_xxxxxxxxxxxxxxxxxxxxxxxx
```

Save this — you need it for the storefront.

Start the backend (development mode):

```bash
npm run dev
```

Backend is now running at **http://localhost:9000**  
Medusa Admin dashboard: **http://localhost:9000/app**

### Step 4 — Set up the Storefront

Open a new terminal:

```bash
cd apps/storefront
```

Create your local `.env.local` file:

```bash
# Windows CMD
copy .env.production.example .env.local

# Mac / Linux
cp .env.production.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxx   ← paste key from seed output
NEXT_PUBLIC_STORE_CURRENCY=inr
```

Install dependencies:

```bash
npm install
```

Start the storefront (development mode):

```bash
npm run dev
```

Storefront is now running at **http://localhost:3000**

### Step 5 — Create Admin User (first time only)

```bash
cd apps/backend-commerce
npx medusa user --email "admin@example.com" --password "YourPassword123!"
```

Log in at: **http://localhost:9000/app**

---

## 4. Environment Variables Reference

### Backend (`apps/backend-commerce/.env`)

| Variable | Description | Local default |
|----------|-------------|---------------|
| `DATABASE_URL` | Full Postgres connection string | `postgres://medusa_user:medusa_pass@localhost:5432/medusa_db` |
| `REDIS_URL` | Full Redis connection string | `redis://localhost:6379` |
| `STORE_CORS` | Allowed storefront origins (comma-separated) | `http://localhost:3000` |
| `ADMIN_CORS` | Allowed Admin dashboard origins | `http://localhost:9000` |
| `AUTH_CORS` | Allowed auth origins (storefront + admin) | `http://localhost:3000,http://localhost:9000` |
| `JWT_SECRET` | JSON Web Token signing secret | `supersecret` (**change in prod**) |
| `COOKIE_SECRET` | Session cookie signing secret | `supersecret` (**change in prod**) |
| `NODE_ENV` | `development` or `production` | `development` |
| `S3_BUCKET` | R2/S3 bucket name | — (optional) |
| `S3_REGION` | R2/S3 region (`auto` for R2) | — (optional) |
| `S3_ENDPOINT` | R2 endpoint URL | — (optional) |
| `S3_ACCESS_KEY_ID` | R2/S3 access key | — (optional) |
| `S3_SECRET_ACCESS_KEY` | R2/S3 secret key | — (optional) |
| `S3_FILE_URL` | Public base URL for uploaded files | — (optional) |

> If no `S3_*` vars are set, Medusa stores files locally in `uploads/` (dev only).

### Storefront (`apps/storefront/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Backend API URL (no trailing slash) | `https://luxury-store-production-0f59.up.railway.app` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Medusa publishable API key | `pk_xxxxxxxxx` |
| `NEXT_PUBLIC_STORE_CURRENCY` | Default display currency code | `inr` |

---

## 5. Database Migrations & Seeding

### Run migrations (safe to run multiple times)

```bash
cd apps/backend-commerce
npx medusa db:migrate
```

This creates/updates all tables. Skips tables that already exist. Safe to run on every deploy.

### Seed data (run once only)

```bash
npx medusa exec src/migration-scripts/initial-data-seed.ts
```

This creates:
- 3 parent product categories (Men, Women, Kids)
- 18 child categories (Shirts, Knitwear, Trousers, etc.)
- 8 luxury products with variants, prices (INR/USD/EUR), and images
- Regions (India, North America, Europe)
- Shipping options (Standard + Express)
- Stock locations and inventory
- A publishable API key

> **Important:** The seed will fail if run more than once (duplicate data). If you need a fresh database:
> ```bash
> docker compose down -v    # destroys local volumes
> docker compose up -d
> npx medusa db:migrate
> npx medusa exec src/migration-scripts/initial-data-seed.ts
> ```

---

## 6. Production Deployment — Backend (Railway)

### First-time setup

1. Push your code to GitHub (one monorepo, all branches included).

2. Go to [railway.app](https://railway.app) → **New Project**.

3. Click **"+ New"** and add:
   - **PostgreSQL** (Railway managed plugin)
   - **Redis** (Railway managed plugin)

4. Click **"+ New" → "GitHub Repo"** → select `luxury-store`.
   - Set **Root Directory**: `apps/backend-commerce`
   - Railway will detect the `Dockerfile` automatically.

5. In the backend service **Variables** tab, add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference) |
   | `REDIS_URL` | `${{Redis.REDIS_URL}}` (reference) |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | generate: `openssl rand -hex 32` |
   | `COOKIE_SECRET` | generate: `openssl rand -hex 32` |
   | `STORE_CORS` | `https://your-store.vercel.app` |
   | `ADMIN_CORS` | `https://your-backend.up.railway.app` |
   | `AUTH_CORS` | `https://your-store.vercel.app,https://your-backend.up.railway.app` |

6. Deploy. Railway will:
   - Build the Docker image (runs `medusa build`)
   - Run `npx medusa db:migrate` before start (preDeployCommand)
   - Start the server via `npm run start` which runs from `.medusa/server`

7. Note the public URL Railway assigns (e.g. `https://luxury-store-production-0f59.up.railway.app`).

### Run seed on Railway (one time)

Install Railway CLI:

```bash
npm install -g @railway/cli
```

SSH into the container:

```bash
railway login
railway link
railway ssh
```

Then inside the container:

```bash
cd /app
npx medusa exec src/migration-scripts/initial-data-seed.ts
```

Copy the **Publishable API Key** from the output.

### Create admin user on Railway

Inside the Railway SSH session:

```bash
cd /app
npx medusa user --email "admin@yourdomain.com" --password "YourStrongPassword!"
```

Admin dashboard: `https://your-backend.up.railway.app/app`

### How the build works

```
Dockerfile (builder stage)
  ├── npm ci                    ← installs all dependencies
  └── npm run build             ← medusa build (builds server + admin dashboard)

Dockerfile (runner stage)
  └── COPY --from=builder /app  ← copies everything including .medusa/ build output

Railway deploy
  ├── preDeployCommand          ← npx medusa db:migrate
  └── startCommand              ← npm run start (cd .medusa/server && npx medusa start)
```

> `.npmrc` sets `legacy-peer-deps=true` globally, which prevents install failures due to peer dependency conflicts in Medusa's dependency graph.

---

## 7. Production Deployment — Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import from GitHub → select `luxury-store`.

2. In the **Configure Project** screen:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/storefront`

3. Add **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://your-backend.up.railway.app` |
   | `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_...` (from seed output) |
   | `NEXT_PUBLIC_STORE_CURRENCY` | `inr` |

4. Click **Deploy**.

5. Note the Vercel URL (e.g. `https://luxury-store.vercel.app`).

6. **Go back to Railway** and update CORS variables with the real Vercel domain:
   - `STORE_CORS` → `https://luxury-store.vercel.app`
   - `AUTH_CORS` → `https://luxury-store.vercel.app,https://luxury-store-production-0f59.up.railway.app`

   Railway will auto-redeploy when you save.

---

## 8. Image Storage — Cloudflare R2

By default, Medusa stores uploaded images on local disk (`uploads/`), which is **not persistent** on Railway. Configure Cloudflare R2 for production image uploads.

### Step 1 — Create R2 bucket

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage**
2. **Create bucket** → name: `luxury-store-uploads`
3. Inside bucket → **Settings** → **Public access** → enable **R2.dev subdomain**
4. Copy the public URL (`https://pub-xxxxxxxx.r2.dev`)

### Step 2 — Create R2 API token

1. R2 dashboard → **Manage R2 API tokens** → **Create API token**
2. Permissions: **Object Read & Write**
3. Scope: Specific bucket — `luxury-store-uploads`
4. Create and save **Access Key ID** and **Secret Access Key**

### Step 3 — Get your Cloudflare Account ID

- Top right corner of Cloudflare dashboard → copy **Account ID**

### Step 4 — Add env vars to Railway

| Variable | Value |
|----------|-------|
| `S3_BUCKET` | `luxury-store-uploads` |
| `S3_REGION` | `auto` |
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `S3_ACCESS_KEY_ID` | from Step 2 |
| `S3_SECRET_ACCESS_KEY` | from Step 2 |
| `S3_FILE_URL` | `https://pub-xxxxxxxx.r2.dev` |

Railway will auto-redeploy. After that, images uploaded via Medusa Admin will be stored in R2 and served via the R2 public URL.

> R2 free tier: 10 GB storage, 1M writes, 10M reads/month. No egress fees.

---

## 9. Creating an Admin User

### Local

```bash
cd apps/backend-commerce
npx medusa user --email "admin@example.com" --password "YourPassword123!"
```

### Production (Railway SSH)

```bash
railway login
railway link
railway ssh
# inside container:
cd /app
npx medusa user --email "admin@yourdomain.com" --password "YourStrongPassword!"
```

Admin dashboard URL:
- Local: `http://localhost:9000/app`
- Production: `https://luxury-store-production-0f59.up.railway.app/app`

---

## 10. CORS Configuration

CORS must always include all origins that access the backend (storefront + admin dashboard).

| Variable | Who it covers | Example |
|----------|--------------|---------|
| `STORE_CORS` | Storefront (customer-facing API) | `https://luxury-store.vercel.app` |
| `ADMIN_CORS` | Medusa Admin dashboard | `https://luxury-store-production-0f59.up.railway.app` |
| `AUTH_CORS` | Login/register (both storefront + admin) | `https://luxury-store.vercel.app,https://luxury-store-production-0f59.up.railway.app` |

> If you add a custom domain later, add it to all three CORS values.

---

## 11. Useful Commands

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend in development mode (auto-reload) |
| `npm run build` | Build for production (`medusa build`) |
| `npm run start` | Start built production server |
| `npx medusa db:migrate` | Run all pending database migrations |
| `npx medusa exec src/migration-scripts/initial-data-seed.ts` | Seed database with products/categories |
| `npx medusa user --email x --password y` | Create admin user |

### Storefront

| Command | Description |
|---------|-------------|
| `npm run dev` | Start storefront in development mode |
| `npm run build` | Build for production |
| `npm run start` | Start production build locally |
| `npm run lint` | Run ESLint |

### Docker (local infrastructure only)

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start Postgres + Redis in background |
| `docker compose down` | Stop containers (keeps data) |
| `docker compose down -v` | Stop containers and **delete all data** |
| `docker compose ps` | List running containers |
| `docker compose logs postgres` | View Postgres logs |

### Railway CLI

| Command | Description |
|---------|-------------|
| `railway login` | Authenticate with Railway |
| `railway link` | Link local project to Railway service |
| `railway ssh` | Open shell in deployed container |
| `railway logs` | Tail production logs |
| `railway status` | Show deployment status |

---

## 12. Troubleshooting

### "Could not find index.html in the admin build directory"
Medusa tried to start without running `medusa build` first. The Dockerfile runs `medusa build` during the Docker build phase — this error means the build artifacts weren't carried into the runtime image. Verify Railway is using `DOCKERFILE` builder (not Nixpacks). Check `railway.json`.

### Railway healthcheck fails (503 service unavailable)
- App must bind to `0.0.0.0` and use `$PORT`.
- Check logs for startup errors before the healthcheck section.
- Healthcheck path is `/health` — verify it returns `200` by opening `https://<backend-domain>/health` in a browser.

### "Publishable API key required"
The storefront is making Store API calls without `x-publishable-api-key`. Make sure `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set in Vercel environment variables and matches a valid key in your Medusa database.

### CORS errors in browser
The browser is hitting a route from an origin not in the CORS allow-list. Update `STORE_CORS`/`AUTH_CORS` on Railway to include your exact Vercel URL (no trailing slash). Railway will auto-redeploy.

### Product images showing `localhost` URLs
Images were uploaded locally and saved with a local URL. Re-upload images from the **hosted** Medusa Admin (`https://<backend-domain>/app`). Configure Cloudflare R2 first (Section 8) to ensure images persist across redeploys.

### OOM crash during build
Medusa admin build is memory-intensive. The `Dockerfile` sets `NODE_OPTIONS=--max-old-space-size=2048`. If crashes persist, increase your Railway service memory to **2GB** in **Service → Settings → Resources**.

### npm peer dependency error
The `.npmrc` file sets `legacy-peer-deps=true` globally. If you see peer dep errors in a fresh install, verify `apps/backend-commerce/.npmrc` exists and contains `legacy-peer-deps=true`.

### Fresh database (local)
```bash
docker compose down -v
docker compose up -d
cd apps/backend-commerce
npx medusa db:migrate
npx medusa exec src/migration-scripts/initial-data-seed.ts
```

---

*Last updated: April 2026*
