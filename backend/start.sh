#!/bin/sh
set -e

echo "Pushing database schema (Prisma)..."
npx prisma db push --accept-data-loss

echo "Running initialization script (Superadmin)..."
node prisma/start-prod.js

echo "Starting Fastify backend server..."
exec npm run start
