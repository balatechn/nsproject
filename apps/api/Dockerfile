FROM node:20-alpine AS installer
WORKDIR /app

# OpenSSL needed by Prisma engine
RUN apk add --no-cache openssl libc6-compat

# Copy manifests first for layer caching
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# Install all deps (devDeps needed for build)
ENV NODE_ENV=development
RUN npm ci

# Copy full source
COPY . .

# Generate Prisma client and build API
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npx turbo run build --filter=@nsproject/api

# Prune devDependencies for smaller production image
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL needed by Prisma engine at runtime
RUN apk add --no-cache openssl libc6-compat

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/packages/database/prisma ./prisma
COPY --from=installer --chown=nestjs:nodejs /app/packages/database/seed.js ./seed.js

USER nestjs
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate || echo '[db push] failed, continuing'; node seed.js || echo '[seed] failed, continuing'; node dist/main.js"]

