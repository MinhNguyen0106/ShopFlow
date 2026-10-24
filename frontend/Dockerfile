# ==============================================================================
# ShopFlow - Frontend Next.js 14 Production Multi-Stage Dockerfile (TASK-26.3)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependencies Cache
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 2: Next.js Standalone Builder
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Biên dịch ứng dụng Next.js tạo thư mục standalone
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Production Runner (< 180MB, Non-root user 'node')
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Cài đặt dumb-init
RUN apk add --no-cache dumb-init

# Chuyển quyền người dùng không đặc quyền
USER node

# Sao chép thư mục public (nếu có) và assets tĩnh
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

EXPOSE 3000

# Health check cho Frontend
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["dumb-init", "node", "server.js"]
