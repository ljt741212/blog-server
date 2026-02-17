import { DatabaseConfig, dbRegToken, IDatabaseConfig } from './database.config';
import { IOssConfig, OssConfig, ossRegToken } from './oss.config';

export * from './database.config';
export * from './oss.config';

export interface AllConfigType {
  [dbRegToken]: IDatabaseConfig;
  [ossRegToken]: IOssConfig;
}

export type ConfigKeyPaths = keyof AllConfigType;

export default {
  DatabaseConfig,
  OssConfig,
};
