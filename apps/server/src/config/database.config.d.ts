import { ConfigType } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
export declare const dbRegToken = "database";
export declare const DatabaseConfig: (() => DataSourceOptions) & import("@nestjs/config").ConfigFactoryKeyHost<DataSourceOptions>;
export type IDatabaseConfig = ConfigType<typeof DatabaseConfig>;
declare const dataSource: DataSource;
export default dataSource;
