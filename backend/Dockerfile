FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace packages package.json
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies (using npm install for workspaces)
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared first
RUN npm run build:shared

# Generate Prisma Client & Build backend
RUN cd backend && npx prisma generate
RUN npm run build:backend

FROM node:20-alpine AS runner

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy built artifacts and node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Set production environment
ENV NODE_ENV=production
EXPOSE 4000

# Run database migration, seed data, and start backend workspace
CMD ["sh", "-c", "cd backend && while ! npx prisma migrate deploy; do echo 'Waiting for Database to be ready...'; sleep 3; done && node prisma/seed.js && cd .. && npm run start --workspace=backend"]
