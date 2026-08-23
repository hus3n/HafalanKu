FROM node:20-alpine AS builder

WORKDIR /app

# Disable Next.js telemetry & allocate memory
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package config files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Install all dependencies using npm workspace
RUN npm ci --no-audit --no-fund

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

# Set the correct permission for nextjs user (optional but good practice)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy public folder
COPY --from=builder /app/frontend/public ./frontend/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# It will copy the standalone output, which contains node_modules and next.js server
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE 3000

# server.js is created by next build from the standalone output
# Since Next.js is inside the frontend workspace, the standalone path should be frontend/server.js
CMD ["node", "frontend/server.js"]
