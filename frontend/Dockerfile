FROM node:20-alpine AS builder

WORKDIR /app

# Disable Next.js telemetry & limit memory usage to prevent VPS OOM killer
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=768"

# Copy package config files for frontend and shared only
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Install dependencies for frontend & shared only (saves 70% RAM & time)
RUN npm ci --workspace=frontend --workspace=shared --include-workspace-root --no-audit --no-fund

# Copy source code
COPY shared ./shared
COPY frontend ./frontend

# Build argument for Next.js client-side public environment variables
ARG NEXT_PUBLIC_API_URL=https://backend-hafalanku.forapp.id/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

# Build workspaces
WORKDIR /app
RUN npm run build:shared
RUN npm run build:frontend

# -------------------------
# Production Runner
# -------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install tzdata for Jakarta timezone
RUN apk add --no-cache tzdata

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV TZ=Asia/Jakarta
ENV NEXT_TELEMETRY_DISABLED=1

# Set the correct permission for nextjs user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy public folder
COPY --from=builder /app/frontend/public ./frontend/public

# Standalone output tracing
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "frontend/server.js"]
