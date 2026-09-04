# Placeholder used only so `prisma generate`/`next build` can resolve the
# DATABASE_URL env var at build time. The real value is injected at runtime.
ARG BUILD_DATABASE_URL=postgresql://build:build@localhost:5432/build

FROM node:22-bookworm-slim AS deps
WORKDIR /app
ARG BUILD_DATABASE_URL
ENV DATABASE_URL=${BUILD_DATABASE_URL}
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# `builder` also doubles as the image used to run `prisma migrate deploy`
# (it has the full node_modules, unlike the pruned standalone runner below).
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ARG BUILD_DATABASE_URL
ENV DATABASE_URL=${BUILD_DATABASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, not
# read at runtime — must be passed as a build arg, not just a container env var.
ARG NEXT_PUBLIC_PAYPAL_DONATE_URL
ENV NEXT_PUBLIC_PAYPAL_DONATE_URL=${NEXT_PUBLIC_PAYPAL_DONATE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
