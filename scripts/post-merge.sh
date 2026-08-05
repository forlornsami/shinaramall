#!/bin/bash
set -e

echo "Running post-merge setup..."
npm install --legacy-peer-deps
echo "Pushing schema to database..."
npm run db:push --yes 2>&1 || npx drizzle-kit push --yes 2>&1
echo "Post-merge setup complete."
