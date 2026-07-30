import { DataTransferService } from './data-transfer.service';
import { WordPressImportService } from './wordpress-import.service';
import type { Response } from 'express';
export declare class DataTransferController {
    private readonly dataTransferService;
    private readonly wpImportService;
    constructor(dataTransferService: DataTransferService, wpImportService: WordPressImportService);
    exportAll(res: Response): Promise<void>;
    importAll(file?: Express.Multer.File, mode?: 'truncate'): Promise<{
        tables: number;
        rows: number;
    }>;
    importWordPress(file?: Express.Multer.File): Promise<{
        posts: number;
        skipped: number;
        images: number;
        imageFails: number;
        errors: string[];
    }>;
}
