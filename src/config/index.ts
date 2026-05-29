import { DatabaseConfig, dbRegToken, IDatabaseConfig } from './database.config';
import { EmailConfig, emailRegToken, IEmailConfig } from './email.config';
import { IOssConfig, OssConfig, ossRegToken } from './oss.config';

export * from './database.config';
export * from './email.config';
export * from './oss.config';

export interface AllConfigType {
  [dbRegToken]: IDatabaseConfig;
  [emailRegToken]: IEmailConfig;
  [ossRegToken]: IOssConfig;
}

export type ConfigKeyPaths = keyof AllConfigType;

export default {
  DatabaseConfig,
  EmailConfig,
  OssConfig,
};
