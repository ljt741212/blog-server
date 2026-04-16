import { ConfigType, registerAs } from '@nestjs/config';
import dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { env, envBoolean, envNumber } from '@/global/env';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
dotenv.config({ path: '.env' });

const currentScript = process.env.npm_lifecycle_event;

const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: env('DB_HOST', '127.0.0.1'),
  port: envNumber('DB_PORT', 3306),
  username: 'root', // env('root'),
  password: '123456', // env('DB_PASSWORD'),
  database: 'blog_db', // env('DB_DATABASE'),
  synchronize: envBoolean('DB_SYNCHRONIZE', false),
  multipleStatements:
    currentScript === 'typeorm' ||
    process.env.npm_lifecycle_event === 'typeorm',
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
