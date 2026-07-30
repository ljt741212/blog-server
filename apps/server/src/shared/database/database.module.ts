import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions, LoggerOptions } from 'typeorm';

import { IDatabaseConfig } from '@/config/database.config';
import { env } from '@/global/env';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        let loggerOptions: LoggerOptions = (env('DB_LOGGING') ??
          'all') as LoggerOptions;

        if (typeof loggerOptions === 'string') {
          try {
            loggerOptions = JSON.parse(loggerOptions) as LoggerOptions;
          } catch {
            // ignore parse error — fall back to string value
          }
        }

        const dbConfig = configService.get<IDatabaseConfig>('database');
        if (!dbConfig) throw new Error('数据库配置缺失');
        return {
          ...dbConfig,
          autoLoadEntities: true,
          logging: loggerOptions,
        };
      },
      dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
})
export class DatabaseModule {}
