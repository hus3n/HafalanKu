FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package config files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Install all dependencies using npm workspace
RUN npm ci

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Generate Prisma Client
WORKDIR /app/backend
RUN npx prisma generate

# Build workspaces
WORKDIR /app
RUN npm run build:shared
RUN npm run build:backend

# -------------------------
# Production Runner
# -------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Set Node environment to production
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

WORKDIR /app/backend

EXPOSE 4000
CMD ["npm", "run", "start"]
