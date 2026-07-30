import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths } from "../../../../../src/config";
export declare class OssService {
    private readonly configService;
    private readonly client;
    private readonly cfg;
    constructor(configService: ConfigService<ConfigKeyPaths>);
    upload(file: Express.Multer.File, dir?: string): Promise<{
        key: string;
        url: string;
        mime: string;
        size: number;
        originalName: string;
        etag: string | undefined;
    }>;
    signUrl(key: string, expires?: number): string;
    getStream(key: string): Promise<{
        stream: NodeJS.ReadableStream;
        res: {
            headers?: Record<string, string | string[] | undefined>;
        };
    }>;
}
