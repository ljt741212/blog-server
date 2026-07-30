import { SignUrlQueryDto, UploadQueryDto } from './dto/oss.dto';
import { OssService } from './oss.service';
import type { Response } from 'express';
export declare class OssController {
    private readonly ossService;
    constructor(ossService: OssService);
    upload(file: Express.Multer.File, query: UploadQueryDto): Promise<{
        key: string;
        url: string;
        mime: string;
        size: number;
        originalName: string;
        etag: string | undefined;
    }>;
    signUrl(query: SignUrlQueryDto): {
        url: string;
    };
    download(key: string, res: Response): Promise<void>;
}
