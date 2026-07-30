import { ConfigType } from '@nestjs/config';
export declare const ossRegToken = "oss";
export declare const OssConfig: (() => {
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
export type IOssConfig = ConfigType<typeof OssConfig>;
