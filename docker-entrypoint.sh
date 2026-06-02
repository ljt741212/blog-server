#!/bin/sh
set -e

echo ">>> waiting for MySQL..."
until node -e "
  const mysql = require('mysql2/promise');
  (async () => {
    try {
      const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'mysql',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
      });
      await c.ping();
      await c.end();
      process.exit(0);
    } catch { process.exit(1); }
  })();
"
do
  echo "  mysql not ready, retrying in 2s..."
  sleep 2
done

echo ">>> running migrations..."
node ./node_modules/typeorm/cli.js migration:run -d ./dist/config/data-source.js

echo ">>> seeding initial data..."
node dist/scripts/seed-admin.js || echo "  seed skipped"

echo ">>> starting app..."
exec node dist/main
