#!/bin/sh

echo "Waiting for Database..."
cd backend

until npx prisma migrate deploy; do
  echo "Migration failed, database might not be ready yet. Retrying in 3 seconds..."
  sleep 3
done

echo "Database migrated! Running Seed..."
node prisma/seed.js

echo "Seed complete! Starting Backend..."
cd ..
npm run start --workspace=backend
