import { existsSync } from 'fs';
import { resolve } from 'path';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

const envPath = resolve(__dirname, '../../.env');
const envDevPath = resolve(
  __dirname,
  `../../.env.${process.env.NODE_ENV || 'development'}`,
);

if (existsSync(envPath)) {
  config({ path: envPath });
}
if (existsSync(envDevPath)) {
  config({ path: envDevPath });
}

const isCompiled = __filename.endsWith('.js');
const entitiesPath = isCompiled
  ? 'dist/modules/**/*.entity.js'
  : 'src/modules/**/*.entity.ts';
const migrationsPath = isCompiled
  ? 'dist/migrations/*.js'
  : 'src/migrations/*.ts';
const subscribersPath = isCompiled
  ? 'dist/**/*.subscriber.js'
  : 'src/**/*.subscriber.ts';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE || 'blog_db',
  synchronize: false,
  logging: true,
  multipleStatements: true,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  subscribers: [subscribersPath],
});
