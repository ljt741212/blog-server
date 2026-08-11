import { ConfigType, registerAs } from '@nestjs/config';
import dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { env, envBoolean, envNumber } from '@/global/env';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
dotenv.config({ path: '.env' });

const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: env('DB_HOST', '127.0.0.1'),
  port: envNumber('DB_PORT', 3306),
  username: env('DB_USERNAME', 'root'),
  password: env('DB_PASSWORD'),
  database: env('DB_DATABASE', 'blog_db'),
  charset: 'utf8mb4',
  synchronize: envBoolean('DB_SYNCHRONIZE', false),
  multipleStatements: true,
  entities: ['dist/modules/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  subscribers: ['dist/**/*.subscriber{.ts,.js}'],
};

export const dbRegToken = 'database';

export const DatabaseConfig = registerAs(
  dbRegToken,
  (): DataSourceOptions => dataSourceOptions,
);

export type IDatabaseConfig = ConfigType<typeof DatabaseConfig>;

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
