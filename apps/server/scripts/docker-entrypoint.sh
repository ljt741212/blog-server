#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/apps/server
pnpm exec typeorm migration:run -d dist/config/data-source.js

echo "Starting application..."
exec node dist/main.js
