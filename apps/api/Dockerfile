FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g turbo

FROM base AS builder
COPY . .
RUN turbo prune --scope=api --docker

FROM base AS installer
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=builder /app/out/full/ .
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN turbo run build --filter=api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/packages/database/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
