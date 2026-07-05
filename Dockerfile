# ── Pensamiento Libre · imagen para Coolify ─────────────────────────────────
# Multi-stage: se compila con todas las deps y se ejecuta solo con las de producción.

# 1) Build
FROM node:22-alpine AS builder
WORKDIR /app

# IMPORTANTE: las variables NEXT_PUBLIC_* se incrustan en el bundle en build-time.
# En Coolify hay que declararlas como "Build Variable" para que lleguen a estos ARG.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Runtime
FROM node:22-alpine AS runner
RUN apk add --no-cache ca-certificates curl
WORKDIR /app
ENV NODE_ENV=production
# Next.js "next start" respeta la variable PORT que inyecta Coolify (default 3000).
ENV PORT=3000

# Variables de servidor (no NEXT_PUBLIC_*) necesarias en runtime, no en build.
# Declararlas en Coolify como variables normales (no "Build Variable").

# Solo dependencias de producción.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Artefactos de build y estáticos.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-3000}/ || exit 1

# Se invoca next directamente para honrar $PORT.
CMD ["sh", "-c", "node_modules/.bin/next start -p ${PORT:-3000}"]
