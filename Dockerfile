# ── Pensamiento Libre · imagen para Coolify ─────────────────────────────────
# Multi-stage: se compila con todas las deps y se ejecuta solo con las de producción.

# 1) Build
FROM node:22-alpine AS builder
WORKDIR /app

# IMPORTANTE: las variables NEXT_PUBLIC_* se incrustan en el bundle en build-time.
# En Coolify hay que declararlas como "Build Variable" para que lleguen a estos ARG.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
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
# El server.js de standalone respeta PORT (Coolify inyecta 3000) y escucha en
# HOSTNAME: sin 0.0.0.0 sólo atendería dentro del contenedor.
ENV PORT=3000 \
    HOSTNAME=0.0.0.0

# Variables de servidor (no NEXT_PUBLIC_*) necesarias en runtime, no en build.
# Declararlas en Coolify como variables normales (no "Build Variable").

# Salida «standalone» (next.config.mjs): un server.js con sólo los módulos que
# la app usa de verdad, en vez de todo node_modules. Desde el 11/10/2026; la
# imagen pasa de ~1 GB a unos cientos de MB. Los estáticos y public/ no van
# dentro de standalone y se copian aparte.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-3000}/api/health || exit 1

CMD ["node", "server.js"]
