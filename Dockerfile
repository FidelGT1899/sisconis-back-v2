# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.12.0

# ---------- Base: solo lo común a todos los stages ----------
FROM node:${NODE_VERSION}-alpine AS base
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

# ---------- Deps: instala TODAS las dependencias (incl. dev) ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- Builder: genera Prisma Client y compila TypeScript ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# ---------- Production-deps: SOLO dependencias de producción ----------
FROM base AS production-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---------- Runner: imagen final, mínima ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S sisconis && adduser -S sisconis -G sisconis

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

USER sisconis
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main.js"]