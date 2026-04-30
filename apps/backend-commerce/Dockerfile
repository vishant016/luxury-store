FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Ensure installs succeed with current peer-deps graph
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
# Give the build more headroom (Railway plan memory still matters)
ENV NODE_OPTIONS=--max-old-space-size=2048

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

COPY --from=builder /app /app

# Medusa listens on 9000 by default; Railway will route to $PORT as well.
EXPOSE 9000

CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]
