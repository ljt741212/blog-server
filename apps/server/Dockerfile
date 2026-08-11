# Stage 1: Build
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY .npmrc ./
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm fetch --frozen-lockfile

COPY . .
RUN pnpm install --frozen-lockfile --offline
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY .npmrc ./
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/packages/ai-agent/package.json ./packages/ai-agent/package.json

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/database ./apps/server/database
COPY --from=builder /app/packages/ai-agent/dist ./packages/ai-agent/dist

EXPOSE 3004

WORKDIR /app/apps/server
CMD ["node", "dist/main.js"]
