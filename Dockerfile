# ---- builder ----
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --prod=false

COPY package.json ./
RUN pnpm install --frozen-lockfile --offline --prod=false

COPY . .

RUN pnpm build

# ---- production ----
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --prod

COPY package.json ./
RUN pnpm install --frozen-lockfile --offline --prod --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3004

ENTRYPOINT ["./docker-entrypoint.sh"]
