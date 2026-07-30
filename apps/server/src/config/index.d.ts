import { dbRegToken, IDatabaseConfig } from './database.config';
import { emailRegToken, IEmailConfig } from './email.config';
import { IOssConfig, ossRegToken } from './oss.config';
export * from './database.config';
export * from './email.config';
export * from './oss.config';
export interface AllConfigType {
    [dbRegToken]: IDatabaseConfig;
    [emailRegToken]: IEmailConfig;
    [ossRegToken]: IOssConfig;
}
export type ConfigKeyPaths = keyof AllConfigType;
declare const _default: {
    DatabaseConfig: (() => import("typeorm").DataSourceOptions) & import("@nestjs/config").ConfigFactoryKeyHost<import("typeorm").DataSourceOptions>;
    EmailConfig: (() => {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
    }) & import("@nestjs/config").ConfigFactoryKeyHost<{
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
    }>;
    OssConfig: (() => {
        region: string;
        accessKeyId: string;
        accessKeySecret: string;
        bucket: string;
        endpoint: string;
        secure: boolean;
        publicBaseUrl: string;
        defaultDir: string;
        signExpires: number;
        maxFileSizeMB: number;
        allowedMimePrefixes: string;
    }) & import("@nestjs/config").ConfigFactoryKeyHost<{
        region: string;
        accessKeyId: string;
        accessKeySecret: string;
        bucket: string;
        endpoint: string;
        secure: boolean;
        publicBaseUrl: string;
        defaultDir: string;
        signExpires: number;
        maxFileSizeMB: number;
        allowedMimePrefixes: string;
    }>;
};
export default _default;
